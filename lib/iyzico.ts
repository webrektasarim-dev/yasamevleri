// iyzico payment integration helper
// Note: This is a simplified implementation. In production, use the official iyzico npm package

interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

interface PaymentRequest {
  price: string;
  paidPrice: string;
  currency: string;
  basketId: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }>;
}

export class IyzicoClient {
  private config: IyzicoConfig;

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || "",
      secretKey: process.env.IYZICO_SECRET_KEY || "",
      baseUrl: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    };
  }

  private generateAuthString(): string {
    // In production, implement proper iyzico authorization header generation
    // This requires HMAC SHA256 encoding
    const authString = `apiKey:${this.config.apiKey}&secretKey:${this.config.secretKey}`;
    return Buffer.from(authString).toString("base64");
  }

  async createPayment(request: PaymentRequest) {
    try {
      // In production environment, use the official iyzico SDK
      // For now, this is a mock implementation for demonstration

      if (!this.config.apiKey || !this.config.secretKey) {
        console.warn("iyzico credentials not configured. Using mock response.");
        return {
          status: "success",
          paymentId: `mock-${Date.now()}`,
          price: request.price,
          paidPrice: request.paidPrice,
          message: "Mock payment successful (iyzico not configured)",
        };
      }

      // Actual iyzico API call would go here
      const response = await fetch(`${this.config.baseUrl}/payment/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.generateAuthString(),
        },
        body: JSON.stringify({
          locale: "tr",
          conversationId: request.basketId,
          ...request,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("iyzico payment error:", error);
      throw error;
    }
  }

  async createPaymentRequest(
    amount: number,
    userId: string,
    duesId: string,
    cardData: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
    },
    buyerInfo: {
      name: string;
      surname: string;
      email: string;
      phone: string;
    }
  ): Promise<any> {
    const request: PaymentRequest = {
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: "TRY",
      basketId: duesId,
      paymentCard: cardData,
      buyer: {
        id: userId,
        name: buyerInfo.name,
        surname: buyerInfo.surname,
        email: buyerInfo.email,
        identityNumber: "11111111111", // Mock identity number
        registrationAddress: "Apartman Site",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: `${buyerInfo.name} ${buyerInfo.surname}`,
        city: "Istanbul",
        country: "Turkey",
        address: "Apartman Site",
      },
      billingAddress: {
        contactName: `${buyerInfo.name} ${buyerInfo.surname}`,
        city: "Istanbul",
        country: "Turkey",
        address: "Apartman Site",
      },
      basketItems: [
        {
          id: duesId,
          name: "Aidat Ödemesi",
          category1: "Aidat",
          itemType: "VIRTUAL",
          price: amount.toFixed(2),
        },
      ],
    };

    return await this.createPayment(request);
  }
}

export const iyzicoClient = new IyzicoClient();







