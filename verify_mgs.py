import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto('http://localhost:3000/four-qrs/mgs', timeout=5000)
            await page.wait_for_selector('canvas')

            # Click the slider to middle step
            slider = page.locator('input[type="range"]')
            await slider.fill('3')
            await page.wait_for_timeout(1000)

            os.makedirs('screenshots', exist_ok=True)
            await page.screenshot(path='screenshots/mgs_step3.png')

            # Click the slider to final step
            await slider.fill('6')
            await page.wait_for_timeout(1000)

            await page.screenshot(path='screenshots/mgs_step6.png')
            print("Screenshots saved")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

asyncio.run(verify())
