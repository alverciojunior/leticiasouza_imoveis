import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { createAppointment, getAppointments } from "./db";

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
});

export type AppRouter = typeof appRouter;
