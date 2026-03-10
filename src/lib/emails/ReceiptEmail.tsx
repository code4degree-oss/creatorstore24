import * as React from 'react'
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components'

interface ReceiptEmailProps {
    orderId: string
    productName: string
    customerName: string
    amount: number
    productType: 'digital' | 'physical'
    downloadLink?: string
}

export const ReceiptEmail = ({
    orderId = 'ORD-1234',
    productName = 'E-Book: Master React',
    customerName = 'John Doe',
    amount = 999,
    productType = 'digital',
    downloadLink = 'https://example.com'
}: ReceiptEmailProps) => {
    const previewText = `Your receipt for ${productName}`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Creator Store 24</Heading>
                    
                    <Text style={text}>Hi {customerName},</Text>
                    <Text style={text}>
                        Thank you for your purchase! Your payment of <strong>₹{amount}</strong> has been successfully processed.
                    </Text>

                    <Section style={orderSection}>
                        <Text style={orderText}><strong>Order ID:</strong> #{orderId.slice(0, 8).toUpperCase()}</Text>
                        <Text style={orderText}><strong>Item:</strong> {productName}</Text>
                    </Section>

                    {productType === 'digital' && downloadLink && (
                        <Section style={buttonContainer}>
                            <Link href={downloadLink} style={button}>
                                Download Your Product
                            </Link>
                        </Section>
                    )}

                    {productType === 'physical' && (
                        <Text style={text}>
                            Your item is being prepared for shipment. You will receive another email as soon as it ships!
                        </Text>
                    )}

                    <Hr style={hr} />
                    <Text style={footer}>
                        Questions? Reply to this email and the creator will get back to you!
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export default ReceiptEmail

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

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
}

const button = {
    backgroundColor: '#4f46e5',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
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
