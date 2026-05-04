import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { createAppointment, getAppointments, createProperty, updateProperty, getProperties, getPropertyById, deleteProperty, addPropertyImage, getPropertyImages, deletePropertyImage, recordPropertyView, getPropertyStats, getAllPropertiesStats, getAppointmentStats, getTotalViews } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  contact: router({
    sendMessage: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome eh obrigatorio"),
          email: z.string().email("Email invalido"),
          phone: z.string().min(1, "Telefone eh obrigatorio"),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await notifyOwner({
            title: "Novo contato do site",
            content: `Nome: ${input.name}\nEmail: ${input.email}\nTelefone: ${input.phone}\nMensagem: ${input.message || "Sem mensagem"}`,
          });
          return { success: true };
        } catch (error) {
          console.error("Erro ao enviar mensagem de contato:", error);
          throw new Error("Erro ao enviar mensagem");
        }
      }),
  }),

  properties: router({
    getAll: publicProcedure.query(async () => {
      try {
        const props = await getProperties();
        const propsWithImages = await Promise.all(
          props.map(async (prop) => ({
            ...prop,
            latitude: prop.latitude ? parseFloat(prop.latitude) : null,
            longitude: prop.longitude ? parseFloat(prop.longitude) : null,
            images: await getPropertyImages(prop.id),
          }))
        );
        return propsWithImages;
      } catch (error) {
        console.error("Erro ao listar propriedades:", error);
        return [];
      }
    }),

    list: publicProcedure.query(async () => {
      try {
        const props = await getProperties();
        const propsWithImages = await Promise.all(
          props.map(async (prop) => ({
            ...prop,
            latitude: prop.latitude ? parseFloat(prop.latitude) : null,
            longitude: prop.longitude ? parseFloat(prop.longitude) : null,
            images: await getPropertyImages(prop.id),
          }))
        );
        return propsWithImages;
      } catch (error) {
        console.error("Erro ao listar propriedades:", error);
        return [];
      }
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        try {
          const prop = await getPropertyById(input.id);
          if (!prop) return null;
          const images = await getPropertyImages(input.id);
          return {
            ...prop,
            latitude: prop.latitude ? parseFloat(prop.latitude) : null,
            longitude: prop.longitude ? parseFloat(prop.longitude) : null,
            images,
          };
        } catch (error) {
          console.error("Erro ao buscar propriedade:", error);
          return null;
        }
      }),

    create: publicProcedure
      .input(
        z.object({
          title: z.string().min(1, "Título eh obrigatorio"),
          location: z.string().min(1, "Localização eh obrigatoria"),
          price: z.string().min(1, "Preço eh obrigatorio"),
          description: z.string().optional(),
          beds: z.number().min(1),
          baths: z.number().min(1),
          area: z.number().min(1),
          featured: z.boolean().default(false),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createProperty({
            ...input,
            featured: input.featured ? 1 : 0,
            latitude: input.latitude?.toString(),
            longitude: input.longitude?.toString(),
          });
          return { success: true };
        } catch (error) {
          console.error("Erro ao criar propriedade:", error);
          throw new Error("Erro ao criar propriedade");
        }
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          location: z.string().optional(),
          price: z.string().optional(),
          description: z.string().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          area: z.number().optional(),
          featured: z.boolean().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { id, ...data } = input;
          const updateData: Record<string, unknown> = {};
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
              if (key === "featured") {
                updateData[key] = value ? 1 : 0;
              } else if (key === "latitude" || key === "longitude") {
                updateData[key] = value?.toString();
              } else {
                updateData[key] = value;
              }
            }
          });
          await updateProperty(id, updateData);
          return { success: true };
        } catch (error) {
          console.error("Erro ao atualizar propriedade:", error);
          throw new Error("Erro ao atualizar propriedade");
        }
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteProperty(input.id);
          return { success: true };
        } catch (error) {
          console.error("Erro ao deletar propriedade:", error);
          throw new Error("Erro ao deletar propriedade");
        }
      }),

    uploadImage: publicProcedure
      .input(
        z.object({
          propertyId: z.number(),
          imageData: z.string(),
          fileName: z.string(),
          order: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const base64Data = input.imageData.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const { url, key } = await storagePut(
            `properties/${input.propertyId}/${Date.now()}-${input.fileName}`,
            buffer,
            'image/jpeg'
          );
          
          await addPropertyImage({
            propertyId: input.propertyId,
            imageUrl: url,
            imageKey: key,
            order: input.order,
          });
          
          return { success: true, url, key };
        } catch (error) {
          console.error("Erro ao fazer upload de imagem:", error);
          throw new Error("Erro ao fazer upload de imagem");
        }
      }),

    addImage: publicProcedure
      .input(
        z.object({
          propertyId: z.number(),
          imageUrl: z.string(),
          imageKey: z.string(),
          order: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await addPropertyImage(input);
          return { success: true };
        } catch (error) {
          console.error("Erro ao adicionar imagem:", error);
          throw new Error("Erro ao adicionar imagem");
        }
      }),

    deleteImage: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deletePropertyImage(input.id);
          return { success: true };
        } catch (error) {
          console.error("Erro ao deletar imagem:", error);
          throw new Error("Erro ao deletar imagem");
        }
      }),
  }),

  appointments: router({
    create: publicProcedure
      .input(
        z.object({
          propertyId: z.number().min(1),
          propertyTitle: z.string().min(1),
          visitorName: z.string().min(1, "Nome eh obrigatorio"),
          visitorEmail: z.string().email("Email invalido"),
          visitorPhone: z.string().min(1, "Telefone eh obrigatorio"),
          visitDate: z.string().min(1, "Data eh obrigatoria"),
          visitTime: z.string().min(1, "Hora eh obrigatoria"),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createAppointment({
            propertyId: input.propertyId,
            propertyTitle: input.propertyTitle,
            visitorName: input.visitorName,
            visitorEmail: input.visitorEmail,
            visitorPhone: input.visitorPhone,
            visitDate: input.visitDate,
            visitTime: input.visitTime,
            message: input.message,
          });

          await notifyOwner({
            title: "Novo agendamento de visita",
            content: `Imovel: ${input.propertyTitle}\nNome: ${input.visitorName}\nEmail: ${input.visitorEmail}\nTelefone: ${input.visitorPhone}\nData: ${input.visitDate}\nHora: ${input.visitTime}\nMensagem: ${input.message || "Sem mensagem"}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Erro ao criar agendamento:", error);
          throw new Error("Erro ao agendar visita");
        }
      }),

    list: publicProcedure.query(async () => {
      try {
        return await getAppointments();
      } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        return [];
      }
    }),
  }),

  stats: router({
    overview: publicProcedure.query(async () => {
      try {
        const appointmentStats = await getAppointmentStats();
        const totalViews = await getTotalViews();
        return {
          totalViews,
          ...appointmentStats,
        };
      } catch (error) {
        console.error("Erro ao obter stats gerais:", error);
        return { totalViews: 0, total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      }
    }),

    properties: publicProcedure.query(async () => {
      try {
        return await getAllPropertiesStats();
      } catch (error) {
        console.error("Erro ao obter stats de propriedades:", error);
        return [];
      }
    }),

    recordView: publicProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await recordPropertyView(input.propertyId);
          return { success: true };
        } catch (error) {
          console.error("Erro ao registrar visualizacao:", error);
          return { success: false };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
