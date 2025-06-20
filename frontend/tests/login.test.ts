import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

describe('Login Page Tests', () => {
    let driver: WebDriver;

    beforeAll(async () => {
        const options = new chrome.Options();
        // Removendo a opção headless para ver a interface gráfica
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--start-maximized'); // Maximiza a janela
        options.addArguments('--lang=pt-BR'); // Forçar idioma português
        options.addArguments('--accept-lang=pt-BR'); // Forçar idioma português

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    afterAll(async () => {
        await driver.quit();
    });

    beforeEach(async () => {
        await driver.get('http://localhost:3000/login');
        // Adiciona um pequeno delay para visualizar melhor
        await driver.sleep(1000);
    });

    test('should display login form', async () => {
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));

        expect(await emailInput.isDisplayed()).toBe(true);
        expect(await passwordInput.isDisplayed()).toBe(true);
        expect(await submitButton.isDisplayed()).toBe(true);
    });

    test('should show error message with invalid credentials', async () => {
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('invalid@email.com');
        await passwordInput.sendKeys('wrongpassword');
        await submitButton.click();

        // Aguardar a mensagem de erro aparecer
        const errorMessage = await driver.wait(
            until.elementLocated(By.css('.chakra-alert')),
            5000
        );

        expect(await errorMessage.isDisplayed()).toBe(true);
        expect(await errorMessage.getText()).toContain('Erro ao fazer login');
    });

    test('should login successfully with valid credentials', async () => {
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('admin@example.com');
        await passwordInput.sendKeys('admin123');
        await submitButton.click();

        // Aguardar redirecionamento para a página inicial
        await driver.wait(
            until.urlIs('http://localhost:3000/dashboard'),
            5000
        );

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe('http://localhost:3000/dashboard');
    });

    test('should show validation messages for empty fields', async () => {
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();

        // Aguardar as mensagens de erro aparecerem
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));

        // Verificar se a mensagem de validação está presente (em português ou inglês)
        const validationMessage = await emailInput.getAttribute('validationMessage');
        expect(['Preencha este campo.', 'Please fill out this field.']).toContain(validationMessage);

        const passwordValidationMessage = await passwordInput.getAttribute('validationMessage');
        expect(['Preencha este campo.', 'Please fill out this field.']).toContain(passwordValidationMessage);
    });
}); 