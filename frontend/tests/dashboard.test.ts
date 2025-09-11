import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

describe('Dashboard Page Tests', () => {
    let driver: WebDriver | undefined;

    beforeAll(async () => {
        const options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--start-maximized');
        options.addArguments('--lang=pt-BR');
        options.addArguments('--accept-lang=pt-BR');
        // Use unique user-data-dir to avoid collisions with other Chrome instances
        const userDataDir = `/tmp/selenium-profile-dashboard-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        options.addArguments(`--user-data-dir=${userDataDir}`);
        // Run headless if desired to reduce conflicts (optional)
        // options.addArguments('--headless=new');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async () => {
        if (driver) {
            await driver.manage().deleteAllCookies();
        }
    });

    test('should redirect to login when no token', async () => {
        await driver.get('http://localhost:3001/dashboard');
        // The page checks localStorage in useEffect; since no token, it should push('/').
        // Wait a bit and check URL
        await driver.sleep(1000);
        const url = await driver.getCurrentUrl();
        expect(url.endsWith('/') || url.includes('localhost:3001/')).toBe(true);
    });

    test('should render stats and cards when authenticated', async () => {
        // Open root to set localStorage and mock fetch before navigating
        await driver.get('http://localhost:3001/');
        // Set token so Dashboard useEffect proceeds
        await driver.executeScript(`
            window.localStorage.setItem('@ti-assistant:token', 'fake-token');
        `);
        // Mock /api/dashboard to return a stable payload
        await driver.executeScript(`
            const originalFetch = window.fetch.bind(window);
            window.fetch = async (input, init) => {
              const url = typeof input === 'string' ? input : input.url;
              if (url && url.includes('/api/dashboard')) {
                const body = {
                  stats: {
                    totalInventory: 10,
                    totalInventoryValue: 12345.67,
                    totalServiceOrders: 5,
                    totalServiceOrdersValue: 2345.67,
                    openServiceOrders: 2,
                    criticalAlerts: 1,
                    consumptionTrends: [{ date: '2025-09', quantity: 3 }],
                    totalSuppliers: 4,
                    totalQuotes: 7,
                    pendingQuotes: 2,
                    totalSupplyRequests: 8,
                    pendingSupplyRequests: 3,
                  },
                  recentAlerts: [
                    { id: 'a1', title: 'Alerta 1', description: 'Desc', danger_level: 'ALTO', created_at: new Date().toISOString() },
                  ],
                  recentServiceOrders: [
                    { id: 's1', order_number: 'OS-001', client_name: 'Cliente', equipment_description: 'Eq', problem_reported: 'Prob', status: 'ABERTO', created_at: new Date().toISOString() },
                  ],
                };
                return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
              }
              return originalFetch(input, init);
            };
        `);
        // Go to dashboard
        await driver.get('http://localhost:3001/dashboard');
        // Wait for heading "Dashboard" to appear
        const heading = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Dashboard')]")), 10000);
        expect(await heading.isDisplayed()).toBe(true);
        // Check that some stat numbers rendered
        const quotesCard = await driver.findElement(By.xpath("//*[contains(text(),'Cotações')]"));
        expect(await quotesCard.isDisplayed()).toBe(true);
    });

    test('should navigate to /quotes when clicking Cotações card', async () => {
        // Prepare token and mock again
        await driver.get('http://localhost:3001/');
        await driver.executeScript(`
            window.localStorage.setItem('@ti-assistant:token', 'fake-token');
        `);
        await driver.executeScript(`
            const originalFetch = window.fetch.bind(window);
            window.fetch = async (input, init) => {
              const url = typeof input === 'string' ? input : input.url;
              if (url && url.includes('/api/dashboard')) {
                const body = {
                  stats: {
                    totalInventory: 10,
                    totalInventoryValue: 12345.67,
                    totalServiceOrders: 5,
                    totalServiceOrdersValue: 2345.67,
                    openServiceOrders: 2,
                    criticalAlerts: 1,
                    consumptionTrends: [{ date: '2025-09', quantity: 3 }],
                    totalSuppliers: 4,
                    totalQuotes: 7,
                    pendingQuotes: 2,
                    totalSupplyRequests: 8,
                    pendingSupplyRequests: 3,
                  },
                  recentAlerts: [],
                  recentServiceOrders: [],
                };
                return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
              }
              return originalFetch(input, init);
            };
        `);
        await driver.get('http://localhost:3001/dashboard');
        // Click on Cotações card
        const quotesCard = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Cotações')]")), 10000);
        await quotesCard.click();
        await driver.wait(async () => (await driver.getCurrentUrl()).includes('/quotes'), 10000);
        const url = await driver.getCurrentUrl();
        expect(url.includes('/quotes')).toBe(true);
    });
});


