import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        print("Navigating to Givens QR...")
        await page.goto("http://localhost:3000/four-qrs/givens")

        print("Waiting for page load...")
        # Wait for the heading to appear to know React has mounted
        await page.wait_for_selector("text=Givens Rotations")

        print("Taking screenshot of step 0...")
        await page.screenshot(path="screenshots/givens_step0.png")

        print("Clicking Next button...")
        try:
            await page.locator('button', has_text="Next").click(timeout=5000)
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/givens_step1.png")
            print("Successfully clicked Next and took screenshot.")

            await page.locator('button', has_text="Next").click(timeout=5000)
            await page.wait_for_timeout(1000)
            await page.screenshot(path="screenshots/givens_step2.png")

        except Exception as e:
            print("Failed to click Next button:", e)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
