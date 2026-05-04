import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { createAppointment, getAppointments, createProperty, updateProperty, getProperties, getPropertyById, deleteProperty, addPropertyImage, getPropertyImages, deletePropertyImage, deleteAllPropertyImages, recordPropertyView, getPropertyStats, getAllPropertiesStats, getAppointmentStats, getTotalViews, getAdminByEmail, createAdminUser, updateAdminPassword, getAllAdminUsers } from "./db";
import { hashPassword, verifyPassword } from "./_core/password";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { makeRequest, GeocodingResult } from "./_core/map";
import { addWatermark } from "./watermark";
const ADMIN_COOKIE_NAME = "admin_session_id";

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
          type: z.enum(["Apartamentos", "Casas", "Comerciais", "Galpões", "Rurais", "Terrenos"]).default("Casas"),
          description: z.string().optional(),
          beds: z.number().min(0),
          baths: z.number().min(0),
          area: z.number().min(1),
          featured: z.boolean().default(false),
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
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
          type: z.enum(["Apartamentos", "Casas", "Comerciais", "Galpões", "Rurais", "Terrenos"]).optional(),
          description: z.string().optional(),
          beds: z.number().optional(),
          baths: z.number().optional(),
          area: z.number().optional(),
          featured: z.boolean().optional(),
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
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
          console.log('[uploadImage] Iniciando upload:', { propertyId: input.propertyId, fileName: input.fileName, dataLength: input.imageData.length });
          
          let base64Data = input.imageData;
          if (input.imageData.includes(',')) {
            base64Data = input.imageData.split(',')[1];
          }
          
          if (!base64Data) {
            throw new Error('Base64 data invalido ou vazio');
          }
          
          console.log('[uploadImage] Base64 extraido:', { length: base64Data.length });
          const buffer = Buffer.from(base64Data, 'base64');
          console.log('[uploadImage] Buffer criado:', { size: buffer.length });
          
          // Sanitizar nome do arquivo removendo espaços e caracteres especiais
          const sanitizedFileName = input.fileName
            .replace(/\s+/g, '-') // Substituir espaços por hífens
            .replace(/[^a-zA-Z0-9._-]/g, '') // Remover caracteres especiais
            .toLowerCase();
          
          // Adicionar marca d'água à imagem
          const watermarkedBuffer = await addWatermark(buffer);
          
          const { url, key } = await storagePut(
            `properties/${input.propertyId}/${Date.now()}-${sanitizedFileName}`,
            watermarkedBuffer,
            'image/jpeg'
          );
          
          console.log('[uploadImage] Upload para storage concluido:', { url, key });
          
          await addPropertyImage({
            propertyId: input.propertyId,
            imageUrl: url,
            imageKey: key,
            order: input.order,
          });
          
          console.log('[uploadImage] Imagem adicionada ao banco de dados com sucesso');
          return { success: true, url, key };
        } catch (error) {
          console.error('[uploadImage] Erro ao fazer upload de imagem:', error);
          throw new Error(`Erro ao fazer upload de imagem: ${error instanceof Error ? error.message : String(error)}`);
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

    deleteAllImages: adminProcedure
      .input(z.object({ propertyId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteAllPropertyImages(input.propertyId);
          console.log(`[deleteAllImages] Todas as imagens removidas para propriedade ${input.propertyId}`);
          return { success: true };
        } catch (error) {
          console.error("Erro ao deletar todas as imagens:", error);
          throw new Error("Erro ao deletar todas as imagens");
        }
      }),
    geocode: publicProcedure
      .input(z.object({ address: z.string().min(1, "Endereco eh obrigatorio") }))
      .mutation(async ({ input }) => {
        try {
          const result = await makeRequest<GeocodingResult>(
            "/maps/api/geocode/json",
            { address: input.address }
          );

          if (result.status !== "OK" || !result.results.length) {
            throw new Error("Endereco nao encontrado");
          }

          const location = result.results[0].geometry.location;
          return {
            success: true,
            latitude: location.lat,
            longitude: location.lng,
            address: result.results[0].formatted_address,
          };
        } catch (error) {
          console.error("Erro ao geocodificar endereco:", error);
          throw new Error("Erro ao geocodificar endereco");
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

  admin: router({
    me: publicProcedure.query(async ({ ctx }) => {
      try {
        const adminIdCookie = ctx.req.cookies[ADMIN_COOKIE_NAME];
        if (!adminIdCookie) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Não autenticado",
          });
        }

        const adminId = parseInt(adminIdCookie, 10);
        if (isNaN(adminId)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão inválida",
          });
        }

        // Get admin from database using the ID
        const admins = await getAllAdminUsers();
        const admin = admins.find((a) => a.id === adminId);

        if (!admin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não encontrado",
          });
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao verificar autenticação",
        });
      }
    }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(1, "Senha é obrigatória"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const admin = await getAdminByEmail(input.email);
          if (!admin) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Email ou senha incorretos",
            });
          }

          const isPasswordValid = verifyPassword(input.password, admin.passwordHash);
          if (!isPasswordValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Email ou senha incorretos",
            });
          }

          // Set admin session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(ADMIN_COOKIE_NAME, admin.id.toString(), {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          });

          return {
            success: true,
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
            },
          };
        } catch (error) {
          console.error("Erro ao fazer login de admin:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao fazer login",
          });
        }
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    changePassword: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          currentPassword: z.string().min(1, "Senha atual é obrigatória"),
          newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const admin = await getAdminByEmail(input.email);
          if (!admin) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Usuário não encontrado",
            });
          }

          const isPasswordValid = verifyPassword(input.currentPassword, admin.passwordHash);
          if (!isPasswordValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Senha atual incorreta",
            });
          }

          const newPasswordHash = hashPassword(input.newPassword);
          await updateAdminPassword(input.email, newPasswordHash);

          return { success: true };
        } catch (error) {
          console.error("Erro ao alterar senha:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao alterar senha",
          });
        }
      }),

    createUser: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
          name: z.string().min(1, "Nome é obrigatório"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const existingAdmin = await getAdminByEmail(input.email);
          if (existingAdmin) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Este email já está registrado",
            });
          }

          const passwordHash = hashPassword(input.password);
          await createAdminUser({
            email: input.email,
            passwordHash,
            name: input.name,
          });

          return { success: true };
        } catch (error) {
          console.error("Erro ao criar usuário admin:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar usuário",
          });
        }
      }),

    listUsers: publicProcedure.query(async () => {
      try {
        const admins = await getAllAdminUsers();
        return admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          createdAt: admin.createdAt,
        }));
      } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return [];
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
