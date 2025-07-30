import { createClient, Base44Error } from '@aisdk';

// Create client
const base44 = createClient({
    appId: 'your-app-id',
    requiresAuth: true,
    debug: true
});

// Example: Working with entities
async function exampleEntities() {
    try {
        // List products
        const products = await base44.entities.Product.list({
            limit: 10,
            sort: 'createdAt:desc'
        });

        // Filter products
        const electronics = await base44.entities.Product.filter({
            category: 'electronics',
            price: { $gte: 100 }
        });

        // Create product
        const newProduct = await base44.entities.Product.create({
            name: 'New Laptop',
            price: 999.99,
            category: 'electronics'
        });

        console.log('Created product:', newProduct);

    } catch (error) {
        if (error instanceof Base44Error) {
            console.error(`API Error: ${error.message}`, error.data);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}

// Example: Authentication
async function exampleAuth() {
    try {
        // Check if authenticated
        const isAuth = await base44.auth.isAuthenticated();

        if (isAuth) {
            // Get current user
            const user = await base44.auth.me();
            console.log('Current user:', user);

            // Update user profile
            const updatedUser = await base44.auth.updateMe({
                preferences: { theme: 'dark' }
            });

            console.log('Updated user:', updatedUser);
        } else {
            // Redirect to login
            base44.auth.login('/dashboard');
        }

    } catch (error) {
        console.error('Auth error:', error);
    }
}

// Example: Integrations
async function exampleIntegrations() {
    try {
        // Send email
        const emailResult = await base44.integrations.Core.SendEmail({
            to: 'user@example.com',
            subject: 'Hello from Base44',
            body: 'This is a test email'
        });

        // Upload file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (file) {
            const uploadResult = await base44.integrations.Core.UploadFile({
                file,
                metadata: { type: 'profile-picture' }
            });

            console.log('Upload result:', uploadResult);
        }

    } catch (error) {
        console.error('Integration error:', error);
    }
}

// Run examples
exampleEntities();
exampleAuth();
exampleIntegrations();