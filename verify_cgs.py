import asyncio
from playwright.async_api import async_playwright
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Starting dev server for verification...")

        # We assume the server is running on port 3000
        # If it isn't, we should start it

        try:
            await page.goto('http://localhost:3000/four-qrs/cgs', timeout=5000)
            await page.wait_for_selector('canvas')

            # Click the slider a bit
            slider = page.locator('input[type="range"]')
            await slider.fill('5')

            # Give it a moment to render
            await page.wait_for_timeout(2000)

            os.makedirs('screenshots', exist_ok=True)
            await page.screenshot(path='screenshots/cgs_updated.png')
            print("Screenshot saved to screenshots/cgs_updated.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

asyncio.run(verify())
