import { chromium } from 'playwright';

export async function scrapeProductList(url) {
    let browser;
    const productData = [];

    try {
        browser = await chromium.launch();
        const page = await browser.newPage();

        console.log(`Navegando a ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        console.log('Esperando por los elementos de producto...');
        await page.waitForSelector('.js-item-product', { state: 'visible', timeout: 60000 });

        const productElements = page.locator('.js-item-product');
        const count = await productElements.count();
        console.log(`Se encontraron ${count} elementos de producto.`);

        for (let i = 0; i < count; i++) {
            const productElement = productElements.nth(i);

            try {
                const variantsContainer = productElement.locator('.js-product-container');

                if (await variantsContainer.count() > 0) {
                    const dataVariantsJson = await variantsContainer.getAttribute('data-variants');

                    if (dataVariantsJson) {
                        try {
                            const variantsData = JSON.parse(dataVariantsJson);
                            productData.push(variantsData);
                        } catch (jsonError) {
                            console.error(`Error al parsear JSON para el producto ${i + 1}: ${jsonError}`);
                        }
                    } else {
                        console.warn(`Atributo data-variants no encontrado en el contenedor para el producto ${i + 1}`);
                    }
                } else {
                    console.warn(`Contenedor .js-product-container no encontrado para el producto ${i + 1}`);
                }

            } catch (innerError) {
                console.error(`Error procesando el elemento de producto ${i + 1}: ${innerError}`);
            }
        }

        console.log('Scraping completado.');

    } catch (error) {
        console.error(`Ocurrió un error durante el scraping: ${error}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return productData;
}
