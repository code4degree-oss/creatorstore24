import * as React from 'react'
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components'

interface ShippingUpdateEmailProps {
    orderId: string
    productName: string
    customerName: string
    storeName: string
    status: string
}

export const ShippingUpdateEmail = ({
    orderId = 'ORD-1234',
    productName = 'Limited Edition Tee',
    customerName = 'John Doe',
    storeName = 'Awesome Store',
    status = 'shipped'
}: ShippingUpdateEmailProps) => {
    const previewText = `Update on your order from${storeName}`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>{storeName}</Heading>
                    
                    <Text style={text}>Hi {customerName},</Text>
                    <Text style={text}>
                        Great news! The physical product you ordered has been marked as <strong>{status.toUpperCase()}</strong>.
                    </Text>

                    <Section style={orderSection}>
                        <Text style={orderText}><strong>Order ID:</strong> #{orderId.slice(0, 8).toUpperCase()}</Text>
                        <Text style={orderText}><strong>Item:</strong> {productName}</Text>
                    </Section>

                    {status === 'shipped' && (
                        <Text style={text}>
                            Your item is on its way. Keep an eye out for it arriving soon!
                        </Text>
                    )}

                    <Hr style={hr} />
                    <Text style={footer}>
                        Questions? Reply to this email to contact the creator directly.
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export default ShippingUpdateEmail

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const h1 = {
    color: '#111827',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
}

const text = {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '24px',
}

const orderSection = {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '24px',
}

const orderText = {
    color: '#111827',
    fontSize: '14px',
    margin: '4px 0',
}

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
}

const footer = {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center' as const,
}
