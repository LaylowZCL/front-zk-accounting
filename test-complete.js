// Teste completo da API Billing Bliss
// Execute com: node test-complete.js

const API_BASE = 'http://localhost:8081/api/v1';
const TEST_TOKEN = '2OqqL49sgOVTq4Zy8WvCJd6XdnhKYKNyOSoa751844e740e7';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
};

async function testEndpoint(name, method, endpoint, body = null) {
    console.log(`\n🧪 Testando: ${name}`);
    console.log(`   ${method} ${endpoint}`);
    
    try {
        const options = {
            method,
            headers
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log(`   ✅ Sucesso!`);
            if (typeof data === 'object' && data.ok) {
                console.log(`   📊 Resposta: ${JSON.stringify(data).substring(0, 100)}...`);
            }
        } else {
            console.log(`   ❌ Erro: ${response.status}`);
            console.log(`   📄 Resposta: ${JSON.stringify(data).substring(0, 200)}...`);
        }
        
        return { success: response.ok, status: response.status, data };
        
    } catch (error) {
        console.log(`   💥 Falha: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runAllTests() {
    console.log('🚀 Iniciando testes completos da API Billing Bliss');
    console.log(`🔗 URL Base: ${API_BASE}`);
    console.log(`🔑 Token: ${TEST_TOKEN.substring(0, 20)}...`);
    
    const results = [];
    
    // Testes de Autenticação
    results.push(await testEndpoint('Auth - Me', 'GET', '/auth/me'));
    results.push(await testEndpoint('Auth - Login', 'POST', '/auth/login', {
        email: 'fernandozucula@gmail.com',
        password: '20002004'
    }));
    
    // Testes de Clientes
    results.push(await testEndpoint('Clientes - Listar', 'GET', '/workspace/clients'));
    results.push(await testEndpoint('Clientes - Criar', 'POST', '/workspace/clients', {
        name: 'Cliente Teste Automático',
        email: 'teste.auto@exemplo.com',
        phone: '+55 11 99999-7777',
        address: 'Rua Teste, 123',
        status: 'active'
    }));
    
    // Testes de Produtos
    results.push(await testEndpoint('Produtos - Listar', 'GET', '/workspace/products'));
    results.push(await testEndpoint('Produtos - Criar', 'POST', '/workspace/products', {
        name: 'Produto Teste Automático',
        description: 'Descrição do produto teste',
        price: 15000,
        type: 'service',
        status: 'active'
    }));
    
    // Testes de Cotações
    results.push(await testEndpoint('Cotações - Listar', 'GET', '/workspace/quotations'));
    results.push(await testEndpoint('Cotações - Criar', 'POST', '/workspace/quotations', {
        clientId: 1,
        date: '2026-03-08',
        validUntil: '2026-03-22',
        status: 'draft',
        notes: 'Cotação teste automático',
        items: [
            {
                description: 'Item Teste 1',
                quantity: 2,
                unitPrice: 250,
                taxRate: 15
            }
        ]
    }));
    
    // Testes de Faturas
    results.push(await testEndpoint('Faturas - Listar', 'GET', '/workspace/invoices'));
    results.push(await testEndpoint('Faturas - Criar', 'POST', '/workspace/invoices', {
        clientId: 1,
        date: '2026-03-08',
        dueDate: '2026-04-08',
        status: 'pending',
        notes: 'Fatura teste automático',
        items: [
            {
                description: 'Serviço Teste',
                quantity: 1,
                unitPrice: 1000,
                taxRate: 15
            }
        ]
    }));
    
    // Testes de Recibos
    results.push(await testEndpoint('Recibos - Listar', 'GET', '/workspace/receipts'));
    results.push(await testEndpoint('Recibos - Criar', 'POST', '/workspace/receipts', {
        clientId: 1,
        date: '2026-03-08',
        status: 'paid',
        paymentMethod: 'bank_transfer',
        amount: 1150,
        notes: 'Recibo teste automático'
    }));
    
    // Testes de Dashboard e Configurações
    results.push(await testEndpoint('Dashboard', 'GET', '/workspace/dashboard'));
    results.push(await testEndpoint('Configurações', 'GET', '/workspace/settings'));
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Testes bem-sucedidos: ${successful}/${results.length}`);
    console.log(`❌ Testes falhados: ${failed}/${results.length}`);
    
    if (failed > 0) {
        console.log('\n❌ TESTES FALHADOS:');
        results.forEach((result, index) => {
            if (!result.success) {
                console.log(`   - Teste ${index + 1}: ${result.error || `Status ${result.status}`}`);
            }
        });
    }
    
    console.log('\n🎉 Testes concluídos!');
    
    if (failed === 0) {
        console.log('🌟 Todos os endpoints estão funcionando perfeitamente!');
    } else {
        console.log('⚠️  Alguns endpoints precisam de atenção.');
    }
}

// Executar testes
runAllTests().catch(console.error);
