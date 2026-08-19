import { z } from 'zod';

export const signupValidationSchema = z
	.object({
		firstName: z.string().trim().min(1, 'First name is required').max(80),
		lastName: z.string().trim().min(1, 'Last name is required').max(80),
		email: z.string().trim().email('Enter a valid email').max(254),
		password: z.string().min(12, 'Password must be at least 12 characters').max(128),
		confirmPassword: z.string(),
		acceptTerms: z.literal(true, { error: 'You must accept the Terms' }),
		acceptPrivacy: z.literal(true, { error: 'You must acknowledge the Privacy Policy' })
	})
	.refine((value) => value.password === value.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords must match'
	});

export const loginValidationSchema = z.object({
	email: z.string().trim().email('Enter a valid email'),
	password: z.string().min(1, 'Password is required'),
	rememberMe: z.boolean().default(true)
});
