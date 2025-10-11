from playwright.sync_api import sync_playwright, expect
import random
import string

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the login page
    page.goto("http://localhost:5173/")

    # Wait for login page to load and find the link/button to register
    register_link = page.get_by_role("button", name="Register")
    expect(register_link).to_be_visible()
    register_link.click()

    # Wait for register page to load
    expect(page.get_by_role("heading", name="Register")).to_be_visible()

    # Use a unique email for registration
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"testuser_{random_string}@example.com"

    # Fill in the registration form
    page.get_by_placeholder("Full Name").fill("Test User")
    page.get_by_placeholder("Email Address").fill(email)
    page.get_by_placeholder("Enter Password").fill("password")

    # Click the register button (submit)
    page.locator('form').get_by_role('button', name='Register').click()

    # After registration, it should go to login page
    expect(page.get_by_role("heading", name="Login")).to_be_visible()

    # Fill in the email and password
    page.get_by_placeholder("Email Address").fill(email)
    page.get_by_placeholder("Enter Password").fill("password")

    # Click the login button
    page.get_by_role("button", name="Login").click()

    # Wait for the dashboard to load
    expect(page.get_by_text("Welcome back")).to_be_visible()

    # Take a screenshot of the dashboard
    page.screenshot(path="jules-scratch/verification/dashboard.png")

    # Open the dashboard overlay
    page.get_by_label("Go to dashboard").click()
    expect(page.get_by_role("heading", name="My Dashboard")).to_be_visible()

    # Take a screenshot of the dashboard overlay
    page.screenshot(path="jules-scratch/verification/dashboard_overlay.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)