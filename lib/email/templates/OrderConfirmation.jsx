import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const OrderConfirmation = ({
  customerName = 'Customer',
  orderNumber = '123456',
  orderDate = new Date().toLocaleDateString(),
  items = [],
  total = 0,
  shippingAddress = {},
  estimatedDelivery = '3-5 business days'
}) => {
  return (
    <Html>
      <Head />
      <Preview>Order #{orderNumber} Confirmed - Alwathba Coop</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Alwathba Coop</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>Order Confirmed!</Heading>
            <Text style={paragraph}>
              Hi {customerName},
            </Text>
            <Text style={paragraph}>
              Thank you for your order! We're getting it ready for shipment.
              Your order number is <strong>#{orderNumber}</strong>.
            </Text>

            <Hr style={hr} />

            <Heading style={h3}>Order Details</Heading>
            <Text style={paragraph}>
              <strong>Order Date:</strong> {orderDate}
            </Text>
            <Text style={paragraph}>
              <strong>Estimated Delivery:</strong> {estimatedDelivery}
            </Text>

            <Hr style={hr} />

            <Heading style={h3}>Items Ordered</Heading>
            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <Text style={itemName}>{item.name}</Text>
                <Text style={itemDetails}>
                  Quantity: {item.quantity} | Price: AED {item.price} |
                  Subtotal: AED {item.quantity * item.price}
                </Text>
              </Section>
            ))}

            <Hr style={hr} />

            <Section style={totalSection}>
              <Text style={totalText}>
                <strong>Total: AED {total}</strong>
              </Text>
            </Section>

            <Hr style={hr} />

            <Heading style={h3}>Shipping Address</Heading>
            <Text style={paragraph}>
              {shippingAddress.name}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}<br />
              {shippingAddress.country}<br />
              Phone: {shippingAddress.phone}
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              You can track your order status in your account dashboard.
            </Text>

            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}`}
              >
                View Order
              </Link>
            </Section>

            <Text style={footer}>
              If you have any questions, please contact us at{' '}
              <Link href="mailto:sales@alwathbacoop.ae">sales@alwathbacoop.ae</Link>
              {' '}or call +971502731313.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '24px',
  backgroundColor: '#007bff',
  textAlign: 'center',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '36px',
  margin: '0',
};

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '30px 0',
};

const h3 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '16px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const itemRow = {
  padding: '10px 0',
  borderBottom: '1px solid #eee',
};

const itemName = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#333',
  margin: '0 0 4px 0',
};

const itemDetails = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const totalSection = {
  textAlign: 'right',
  padding: '20px 0',
};

const totalText = {
  fontSize: '20px',
  color: '#333',
};

const buttonContainer = {
  textAlign: 'center',
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center',
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0 0',
};

export default OrderConfirmation;