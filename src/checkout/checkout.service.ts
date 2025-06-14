import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrder(checkoutDto: CheckoutDto) {
    const { cartId, deliveryAddress, paymentMethod } = checkoutDto;

    // Obter o carrinho com itens e cálculos
    const cart = await this.cartService.getCart(cartId);

    // Criar o pedido
    const order = await this.prisma.order.create({
      data: {
        cart: { connect: { id: cartId } },
        totalItems: 10,
        shippingFee: 1,
        totalAmount: 2,
        status: PaymentStatus.PENDENTE,
        // Aqui você poderia salvar também o endereço e método de pagamento
        // em modelos adicionais relacionados ao pedido
      },
    });

    // Formatar a resposta
    return {
      id: order.id,
      items: [],
      uniqueCategories: 1,
      itemsTotal: Number(order.totalItems),
      shippingFee: Number(order.shippingFee),
      total: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    };
  }
} 