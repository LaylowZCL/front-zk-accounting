import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Za-z]/, 'A senha deve conter letras')
    .regex(/[0-9]/, 'A senha deve conter números'),
  plan_id: z.coerce.number().int().min(1, 'Selecione um pacote'),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Za-z]/, 'A nova senha deve conter letras')
      .regex(/[0-9]/, 'A nova senha deve conter números'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
