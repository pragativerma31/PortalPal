from datetime import datetime

def calculate_semester_and_year(rollno: str):
    # Extract year of admission from roll number
    try:
        admission_year = int(rollno[:4])
    except ValueError:
        raise ValueError("Invalid roll number format. Must start with admission year.")

    # Get current date info
    now = datetime.now()
    current_year = now.year
    current_month = now.month

    # Calculate academic year format: "2024-25"
    def format_academic_year(start_year: int):
        end_year_short = str(start_year + 1)[-2:]
        return f"{start_year}-{end_year_short}"

    year_diff = current_year - admission_year

    if current_month >= 8:
        # Aug–Dec → Odd semester, new academic year starts
        semester = year_diff * 2 + 1
        academic_year = format_academic_year(current_year)
    else:
        # Jan–May → Even semester, academic year is previous-current
        semester = year_diff * 2 
        academic_year = format_academic_year(current_year - 1)

    return semester, academic_year

def ordinal_suffix(n: int) -> str:
    if 10 <= n % 100 <= 20:
        return f"{n}th"
    else:
        return f"{n}{ {1:'st', 2:'nd', 3:'rd'}.get(n % 10, 'th') }"
