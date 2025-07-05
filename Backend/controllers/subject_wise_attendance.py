import re
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

def extract_daily_attendance(driver: WebDriver, subject_codes: list[str]) -> dict:
    # Initialize the attendance log dictionary
    daily_attendance = {code: [] for code in subject_codes}

    # Regex pattern to detect date strings like "Jan-01", "Aug-25", etc.
    date_pattern = re.compile(r"^[A-Za-z]{3}-\d{2}$")

    # Find all rows in the attendance table
    all_rows = driver.find_elements(By.XPATH, "//tr[td]")

    for row in all_rows:
        tds = row.find_elements(By.TAG_NAME, "td")
        if not tds:
            continue

        date_text = tds[0].text.strip()
        if not date_pattern.match(date_text):
            continue  # Skip rows that don't start with a valid date

        # Match each attendance cell to its subject
        for i, code in enumerate(subject_codes):
            if i + 1 < len(tds):
                status = tds[i + 1].text.strip()
                daily_attendance[code].append({
                    "date": date_text,
                    "status": status
                })

    return daily_attendance
