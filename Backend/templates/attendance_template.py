# utils/display_templates.py
import html  # Import html module for unescaping HTML entities

def get_attendance_block(subject_codes, subject_names, total_classes, absents, presents, daily_attendance_log):
    summary = []

    for i in range(len(subject_codes)):
        subject_code = subject_codes[i]
        subject_name = subject_names[i] if i < len(subject_names) else "Unknown"
        # Ensure subject name is properly decoded (in case it wasn't already)
        subject_name = html.unescape(subject_name)
        total = total_classes[i]
        absent = absents[i]
        present = presents[i]
        percent = f"{(present / total * 100):.2f}%" if total > 0 else "N/A"

        # Get daily log for the current subject, if it exists
        daily_log = daily_attendance_log.get(subject_code, [])

        summary.append({
            "subject_code": subject_code,
            "subject_name": subject_name,
            "total_classes": total,
            "absents": absent,
            "presents": present,
            "percentage": percent,
            "dailyLog": daily_log  # ✅ Changed from daily_log to dailyLog for frontend consistency
        })

    return summary

