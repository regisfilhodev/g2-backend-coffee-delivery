import { Cart as PrismaCart, CartStatus, PaymentStatus } from '@prisma/client';

export class Cart implements PrismaCart {
  id: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: CartStatus;
  statusPayment: PaymentStatus;
  dateTimeCompleted: Date | null;
} 