import { chromium } from 'playwright'; // Puedes cambiar a 'firefox' o 'webkit' si lo necesitas

async function scrapeProductList(url) {
    let browser;
    const productData = [];

    try {
        // 1. Lanzar el navegador
        browser = await chromium.launch();
        const page = await browser.newPage();

        // 2. Navegar a la página
        console.log(`Navegando a ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded' }); // Espera a que el DOM esté cargado

        // 3. Esperar a que los elementos de producto estén presentes
        // Es importante esperar para asegurarse de que el contenido dinámico se cargue
        console.log('Esperando por los elementos de producto...');
        await page.waitForSelector('.js-item-product', { state: 'visible', timeout: 60000 }); // Espera hasta 60 segundos

        // 4. Seleccionar todos los elementos de producto
        const productElements = page.locator('.js-item-product');
        const count = await productElements.count();
        console.log(`Se encontraron ${count} elementos de producto.`);

        // 5. Iterar sobre cada elemento de producto y extraer datos
        for (let i = 0; i < count; i++) {
            const productElement = productElements.nth(i);

            try {
                // 6. Encontrar el contenedor con el atributo data-variants dentro del elemento de producto
                const variantsContainer = productElement.locator('.js-product-container');

                // Verificar si el contenedor existe antes de intentar obtener el atributo
                if (await variantsContainer.count() > 0) {
                     // 7. Obtener el valor del atributo data-variants
                    const dataVariantsJson = await variantsContainer.getAttribute('data-variants');

                    if (dataVariantsJson) {
                        try {
                            // 8. Parsear el string JSON
                            const variantsData = JSON.parse(dataVariantsJson);
                            productData.push(variantsData);
                            // console.log(`Datos scrapeados para el producto ${i + 1}`);
                        } catch (jsonError) {
                            console.error(`Error al parsear JSON para el producto ${i + 1}: ${jsonError}`);
                            // Opcional: almacenar el string crudo si el parseo falla
                            // productData.push({ raw_variants_data: dataVariantsJson });
                        }
                    } else {
                         console.warn(`Atributo data-variants no encontrado en el contenedor para el producto ${i + 1}`);
                    }
                } else {
                     console.warn(`Contenedor .js-product-container no encontrado para el producto ${i + 1}`);
                }

            } catch (innerError) {
                console.error(`Error procesando el elemento de producto ${i + 1}: ${innerError}`);
                // Continuar con el siguiente elemento incluso si uno falla
            }
        }

        console.log('Scraping completado.');

    } catch (error) {
        console.error(`Ocurrió un error durante el scraping: ${error}`);
    } finally {
        // 9. Cerrar el navegador
        if (browser) {
            await browser.close();
        }
    }

    return productData;
}

// --- Cómo usar la función ---
// Reemplaza con la URL real de la página que quieres scrapear
const targetUrl = 'https://shop.tribudejah.com/otono-invierno-25/pantalones/?mpage=2';
scrapeProductList(targetUrl)
    .then(scrapedInfo => {
        if (scrapedInfo.length > 0) {
            console.log("\n--- Datos de Productos Scrapeados ---");
            // 'scrapedInfo' es un array donde cada elemento es el array
            // de variantes parseado del atributo data-variants de un producto.
            scrapedInfo.forEach((productVariants, index) => {
                console.log(`\nProducto ${index + 1}:`);
                 // productVariants es un array de objetos variante
                 productVariants.forEach(variant => {
                     console.log(`  - ID: ${variant.id || 'N/A'}`);
                     console.log(`    Precio: ${variant.price_short || 'N/A'}`);
                     console.log(`    Stock: ${variant.stock !== undefined ? variant.stock : 'N/A'}`); // Stock puede ser 0
                     console.log(`    Color: ${variant.option0 || 'N/A'}`);
                     console.log(`    Talle: ${variant.option1 || 'N/A'}`);
                     console.log(`    Imagen URL: ${variant.image_url || 'N/A'}`);
                     // Puedes acceder a otros campos según la estructura de tu JSON
                 });
            });
        } else {
            console.log("\nNo se encontraron datos de productos.");
        }
    })
    .catch(error => {
        console.error("Error al ejecutar la función de scraping:", error);
    });


