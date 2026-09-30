import type { Question } from "@/types/exam";

/**
 * Question bank for the one-time examination.
 * Replace or edit these items before the sitting. There is no question editor.
 * `correctAnswer` is an option id. It stays attached to that option when the
 * displayed order is shuffled.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q01",
    question:
      "Which component of the CPU is responsible for performing mathematical and logical operations?",
    options: [
      { id: "q01a", text: "Control Unit (CU)" },
      { id: "q01b", text: "Arithmetic Logic Unit (ALU)" },
      { id: "q01c", text: "Cache Memory" },
      { id: "q01d", text: "Registers" },
    ],
    correctAnswer: "q01b",
  },
  {
    id: "q02",
    question:
      "Which type of memory is volatile and loses its contents when the power is turned off?",
    options: [
      { id: "q02a", text: "ROM" },
      { id: "q02b", text: "Flash Memory" },
      { id: "q02c", text: "RAM" },
      { id: "q02d", text: "Hard Disk Drive" },
    ],
    correctAnswer: "q02c",
  },
  {
    id: "q03",
    question: "What is the full form of BIOS in computer hardware?",
    options: [
      { id: "q03a", text: "Basic Input Output System" },
      { id: "q03b", text: "Binary Integrated Operating System" },
      { id: "q03c", text: "Built-in Operating System" },
      { id: "q03d", text: "Basic Internal Output Storage" },
    ],
    correctAnswer: "q03a",
  },
  {
    id: "q04",
    question:
      "Which non-volatile memory stores essential initial boot instructions for starting a PC?",
    options: [
      { id: "q04a", text: "SRAM" },
      { id: "q04b", text: "DRAM" },
      { id: "q04c", text: "ROM" },
      { id: "q04d", text: "Cache" },
    ],
    correctAnswer: "q04c",
  },
  {
    id: "q05",
    question: "One Gigabyte (1 GB) is equal to how many Megabytes (MB)?",
    options: [
      { id: "q05a", text: "1000 MB" },
      { id: "q05b", text: "1024 MB" },
      { id: "q05c", text: "512 MB" },
      { id: "q05d", text: "2048 MB" },
    ],
    correctAnswer: "q05b",
  },
  {
    id: "q06",
    question: "Which of the following is an input device?",
    options: [
      { id: "q06a", text: "Plotter" },
      { id: "q06b", text: "Optical Character Reader (OCR)" },
      { id: "q06c", text: "Monitor" },
      { id: "q06d", text: "Speaker" },
    ],
    correctAnswer: "q06b",
  },
  {
    id: "q07",
    question: "What type of device is a Solid State Drive (SSD)?",
    options: [
      { id: "q07a", text: "Primary Storage" },
      { id: "q07b", text: "Secondary Non-Volatile Storage" },
      { id: "q07c", text: "Cache Memory" },
      { id: "q07d", text: "Virtual Memory" },
    ],
    correctAnswer: "q07b",
  },
  {
    id: "q08",
    question:
      "Which computer port is primarily used to connect high-definition monitor displays and audio simultaneously?",
    options: [
      { id: "q08a", text: "VGA" },
      { id: "q08b", text: "Serial Port" },
      { id: "q08c", text: "HDMI" },
      { id: "q08d", text: "PS/2" },
    ],
    correctAnswer: "q08c",
  },
  {
    id: "q09",
    question: "What is the main purpose of CPU Cache memory?",
    options: [
      { id: "q09a", text: "Increase permanent disk space" },
      { id: "q09b", text: "Speed up access to frequently used data" },
      { id: "q09c", text: "Store long-term OS system files" },
      { id: "q09d", text: "Process graphic renderings" },
    ],
    correctAnswer: "q09b",
  },
  {
    id: "q10",
    question:
      "Which software manages hardware resources and acts as an interface between user and computer?",
    options: [
      { id: "q10a", text: "Application Software" },
      { id: "q10b", text: "Operating System" },
      { id: "q10c", text: "Firmware" },
      { id: "q10d", text: "Device Driver" },
    ],
    correctAnswer: "q10b",
  },
  {
    id: "q11",
    question: "What is the shortcut key to align selected text to the center in MS Word?",
    options: [
      { id: "q11a", text: "Ctrl + C" },
      { id: "q11b", text: "Ctrl + E" },
      { id: "q11c", text: "Ctrl + J" },
      { id: "q11d", text: "Ctrl + R" },
    ],
    correctAnswer: "q11b",
  },
  {
    id: "q12",
    question: "Which keyboard shortcut is used to insert a Page Break in Microsoft Word?",
    options: [
      { id: "q12a", text: "Alt + Enter" },
      { id: "q12b", text: "Shift + Enter" },
      { id: "q12c", text: "Ctrl + Enter" },
      { id: "q12d", text: "Ctrl + Shift + Enter" },
    ],
    correctAnswer: "q12c",
  },
  {
    id: "q13",
    question:
      "What is the default file extension for Microsoft Word documents in modern versions (2007 and later)?",
    options: [
      { id: "q13a", text: ".doc" },
      { id: "q13b", text: ".docx" },
      { id: "q13c", text: ".txt" },
      { id: "q13d", text: ".rtf" },
    ],
    correctAnswer: "q13b",
  },
  {
    id: "q14",
    question:
      "Which tool in MS Word allows you to copy formatting from one piece of text and apply it to another?",
    options: [
      { id: "q14a", text: "Format Painter" },
      { id: "q14b", text: "AutoFormat" },
      { id: "q14c", text: "Styles" },
      { id: "q14d", text: "Copy Special" },
    ],
    correctAnswer: "q14a",
  },
  {
    id: "q15",
    question:
      "Which feature in MS Word is used to send personalized letters or emails to multiple recipients simultaneously?",
    options: [
      { id: "q15a", text: "Mail Merge" },
      { id: "q15b", text: "Macro" },
      { id: "q15c", text: "Track Changes" },
      { id: "q15d", text: "Cross-reference" },
    ],
    correctAnswer: "q15a",
  },
  {
    id: "q16",
    question: "Shortcut key Ctrl + Shift + > in MS Word is used to:",
    options: [
      { id: "q16a", text: "Decrease font size" },
      { id: "q16b", text: "Increase font size" },
      { id: "q16c", text: "Change case" },
      { id: "q16d", text: "Insert subscript" },
    ],
    correctAnswer: "q16b",
  },
  {
    id: "q17",
    question: "To superscript selected text in MS Word, which shortcut key is used?",
    options: [
      { id: "q17a", text: "Ctrl + =" },
      { id: "q17b", text: "Ctrl + Shift + +" },
      { id: "q17c", text: "Alt + Shift + =" },
      { id: "q17d", text: "Ctrl + Alt + S" },
    ],
    correctAnswer: "q17b",
  },
  {
    id: "q18",
    question:
      "In MS Word, headers and footers are displayed by default in which view layout?",
    options: [
      { id: "q18a", text: "Draft View" },
      { id: "q18b", text: "Web Layout" },
      { id: "q18c", text: "Print Layout View" },
      { id: "q18d", text: "Outline View" },
    ],
    correctAnswer: "q18c",
  },
  {
    id: "q19",
    question: "Which function key opens the 'Spelling and Grammar' check dialog in MS Word?",
    options: [
      { id: "q19a", text: "F5" },
      { id: "q19b", text: "F7" },
      { id: "q19c", text: "F12" },
      { id: "q19d", text: "Shift + F3" },
    ],
    correctAnswer: "q19b",
  },
  {
    id: "q20",
    question: "What is the maximum number of columns that can be inserted in a Word table?",
    options: [
      { id: "q20a", text: "32" },
      { id: "q20b", text: "45" },
      { id: "q20c", text: "63" },
      { id: "q20d", text: "128" },
    ],
    correctAnswer: "q20c",
  },
  {
    id: "q21",
    question: "In MS Excel, all formulas must start with which character?",
    options: [
      { id: "q21a", text: "+" },
      { id: "q21b", text: "=" },
      { id: "q21c", text: "@" },
      { id: "q21d", text: "#" },
    ],
    correctAnswer: "q21b",
  },
  {
    id: "q22",
    question:
      "Which Excel formula is used to look up a value in the leftmost column of a table and return a value in the same row?",
    options: [
      { id: "q22a", text: "HLOOKUP" },
      { id: "q22b", text: "VLOOKUP" },
      { id: "q22c", text: "INDEX" },
      { id: "q22d", text: "MATCH" },
    ],
    correctAnswer: "q22b",
  },
  {
    id: "q23",
    question:
      "What keyboard shortcut locks a cell reference (e.g., converting A1 to $A$1) while editing a formula in Excel?",
    options: [
      { id: "q23a", text: "F2" },
      { id: "q23b", text: "F4" },
      { id: "q23c", text: "F8" },
      { id: "q23d", text: "Ctrl + L" },
    ],
    correctAnswer: "q23b",
  },
  {
    id: "q24",
    question:
      "Which Excel function returns the total number of cells containing numbers within a range?",
    options: [
      { id: "q24a", text: "COUNTA" },
      { id: "q24b", text: "COUNT" },
      { id: "q24c", text: "COUNTBLANK" },
      { id: "q24d", text: "SUM" },
    ],
    correctAnswer: "q24b",
  },
  {
    id: "q25",
    question: "In MS Excel, what does the symbol '###' appearing in a cell indicate?",
    options: [
      { id: "q25a", text: "Formula Error" },
      { id: "q25b", text: "Division by Zero" },
      { id: "q25c", text: "Cell column width is too narrow" },
      { id: "q25d", text: "Invalid Data Type" },
    ],
    correctAnswer: "q25c",
  },
  {
    id: "q26",
    question:
      "Which feature in MS Excel summarizes large datasets using pivot tables and aggregation?",
    options: [
      { id: "q26a", text: "Data Validation" },
      { id: "q26b", text: "Pivot Table" },
      { id: "q26c", text: "Conditional Formatting" },
      { id: "q26d", text: "Goal Seek" },
    ],
    correctAnswer: "q26b",
  },
  {
    id: "q27",
    question: "Which shortcut key is used to select an entire column in Microsoft Excel?",
    options: [
      { id: "q27a", text: "Ctrl + Space" },
      { id: "q27b", text: "Shift + Space" },
      { id: "q27c", text: "Alt + Space" },
      { id: "q27d", text: "Ctrl + Shift + Arrow" },
    ],
    correctAnswer: "q27a",
  },
  {
    id: "q28",
    question: "What does the function `=CONCATENATE(A1, B1)` or `=A1&B1` do?",
    options: [
      { id: "q28a", text: "Adds values of A1 and B1" },
      { id: "q28b", text: "Joins text strings of A1 and B1" },
      { id: "q28c", text: "Compares A1 and B1" },
      { id: "q28d", text: "Calculates percentage" },
    ],
    correctAnswer: "q28b",
  },
  {
    id: "q29",
    question:
      "In Excel, which feature restricts user entry to specific allowed data types or lists?",
    options: [
      { id: "q29a", text: "Data Validation" },
      { id: "q29b", text: "Consolidate" },
      { id: "q29c", text: "Conditional Formatting" },
      { id: "q29d", text: "AutoCorrect" },
    ],
    correctAnswer: "q29a",
  },
  {
    id: "q30",
    question: "What is the default alignment for numbers in MS Excel cells?",
    options: [
      { id: "q30a", text: "Left aligned" },
      { id: "q30b", text: "Right aligned" },
      { id: "q30c", text: "Centered" },
      { id: "q30d", text: "Justified" },
    ],
    correctAnswer: "q30b",
  },
  {
    id: "q31",
    question: "Which shortcut key starts a PowerPoint slide show from the beginning?",
    options: [
      { id: "q31a", text: "Shift + F5" },
      { id: "q31b", text: "F5" },
      { id: "q31c", text: "Ctrl + F5" },
      { id: "q31d", text: "F11" },
    ],
    correctAnswer: "q31b",
  },
  {
    id: "q32",
    question:
      "Which feature in PowerPoint allows you to apply visual movement effects to individual slide elements?",
    options: [
      { id: "q32a", text: "Slide Transition" },
      { id: "q32b", text: "Animation" },
      { id: "q32c", text: "Slide Master" },
      { id: "q32d", text: "SmartArt" },
    ],
    correctAnswer: "q32b",
  },
  {
    id: "q33",
    question: "What is the shortcut key to duplicate a selected slide in MS PowerPoint?",
    options: [
      { id: "q33a", text: "Ctrl + N" },
      { id: "q33b", text: "Ctrl + D" },
      { id: "q33c", text: "Ctrl + M" },
      { id: "q33d", text: "Ctrl + Shift + D" },
    ],
    correctAnswer: "q33b",
  },
  {
    id: "q34",
    question: "Which view in PowerPoint is used to easily reorder and organize slides?",
    options: [
      { id: "q34a", text: "Slide Sorter View" },
      { id: "q34b", text: "Normal View" },
      { id: "q34c", text: "Reading View" },
      { id: "q34d", text: "Notes Page" },
    ],
    correctAnswer: "q34a",
  },
  {
    id: "q35",
    question:
      "What is the file extension for a PowerPoint Show file that automatically launches presentation mode?",
    options: [
      { id: "q35a", text: ".pptx" },
      { id: "q35b", text: ".ppsx" },
      { id: "q35c", text: ".potx" },
      { id: "q35d", text: ".pptm" },
    ],
    correctAnswer: "q35b",
  },
  {
    id: "q36",
    question:
      "Which Windows tool is used to end unresponsive processes and monitor real-time resource usage?",
    options: [
      { id: "q36a", text: "Control Panel" },
      { id: "q36b", text: "Task Manager" },
      { id: "q36c", text: "Event Viewer" },
      { id: "q36d", text: "Device Manager" },
    ],
    correctAnswer: "q36b",
  },
  {
    id: "q37",
    question: "What is the shortcut key to open the Windows Run dialog box?",
    options: [
      { id: "q37a", text: "Win + R" },
      { id: "q37b", text: "Win + E" },
      { id: "q37c", text: "Win + L" },
      { id: "q37d", text: "Win + X" },
    ],
    correctAnswer: "q37a",
  },
  {
    id: "q38",
    question:
      "Which command line tool in Windows tests network connectivity to a specific IP address?",
    options: [
      { id: "q38a", text: "ipconfig" },
      { id: "q38b", text: "ping" },
      { id: "q38c", text: "tracert" },
      { id: "q38d", text: "nslookup" },
    ],
    correctAnswer: "q38b",
  },
  {
    id: "q39",
    question:
      "What is the main function of an Operating System's file system (e.g., NTFS, FAT32)?",
    options: [
      { id: "q39a", text: "Virus scanning" },
      { id: "q39b", text: "Organizing and storing data on storage media" },
      { id: "q39c", text: "Displaying graphics" },
      { id: "q39d", text: "Managing RAM allocation" },
    ],
    correctAnswer: "q39b",
  },
  {
    id: "q40",
    question:
      "In Windows OS, which command in Command Prompt displays the computer's current IP address configuration?",
    options: [
      { id: "q40a", text: "ping" },
      { id: "q40b", text: "ipconfig" },
      { id: "q40c", text: "netstat" },
      { id: "q40d", text: "chkdsk" },
    ],
    correctAnswer: "q40b",
  },
  {
    id: "q41",
    question: "What does the acronym HTTP stand for in web browsing?",
    options: [
      { id: "q41a", text: "HyperText Transfer Protocol" },
      { id: "q41b", text: "High Technical Transfer Program" },
      { id: "q41c", text: "Hyperlink Text Terminal Process" },
      { id: "q41d", text: "Host Text Transfer Provider" },
    ],
    correctAnswer: "q41a",
  },
  {
    id: "q42",
    question:
      "Which IP address class is reserved for private local area networks (e.g., 192.168.1.1)?",
    options: [
      { id: "q42a", text: "Class A" },
      { id: "q42b", text: "Class B" },
      { id: "q42c", text: "Class C" },
      { id: "q42d", text: "Class D" },
    ],
    correctAnswer: "q42c",
  },
  {
    id: "q43",
    question:
      "Which device connects different networks together and routes data packets between them based on IP addresses?",
    options: [
      { id: "q43a", text: "Switch" },
      { id: "q43b", text: "Hub" },
      { id: "q43c", text: "Router" },
      { id: "q43d", text: "Repeater" },
    ],
    correctAnswer: "q43c",
  },
  {
    id: "q44",
    question: "What is the primary function of a Firewall in a computer network?",
    options: [
      { id: "q44a", text: "Speeding up internet connections" },
      { id: "q44b", text: "Filtering unauthorized network access" },
      { id: "q44c", text: "Storing backup files" },
      { id: "q44d", text: "Allocating IP addresses" },
    ],
    correctAnswer: "q44b",
  },
  {
    id: "q45",
    question:
      "What standard protocol is used for sending outgoing email messages across the internet?",
    options: [
      { id: "q45a", text: "POP3" },
      { id: "q45b", text: "IMAP" },
      { id: "q45c", text: "SMTP" },
      { id: "q45d", text: "FTP" },
    ],
    correctAnswer: "q45c",
  },
  {
    id: "q46",
    question: "What protocol automatically assigns IP addresses to devices on a network?",
    options: [
      { id: "q46a", text: "DNS" },
      { id: "q46b", text: "DHCP" },
      { id: "q46c", text: "HTTP" },
      { id: "q46d", text: "ARP" },
    ],
    correctAnswer: "q46b",
  },
  {
    id: "q47",
    question: "What is the length of an IPv4 address in bits?",
    options: [
      { id: "q47a", text: "16 bits" },
      { id: "q47b", text: "32 bits" },
      { id: "q47c", text: "64 bits" },
      { id: "q47d", text: "128 bits" },
    ],
    correctAnswer: "q47b",
  },
  {
    id: "q48",
    question: "A malicious program that disguises itself as legitimate software is known as a:",
    options: [
      { id: "q48a", text: "Trojan Horse" },
      { id: "q48b", text: "Worm" },
      { id: "q48c", text: "Spyware" },
      { id: "q48d", text: "Ransomware" },
    ],
    correctAnswer: "q48a",
  },
  {
    id: "q49",
    question: "What does the acronym HMIS stand for in health management system administration?",
    options: [
      { id: "q49a", text: "Health Management Information System" },
      { id: "q49b", text: "Hospital Maintenance & Inspection Service" },
      { id: "q49c", text: "Healthcare Module Integration Software" },
      { id: "q49d", text: "High Medical Information Storage" },
    ],
    correctAnswer: "q49a",
  },
  {
    id: "q50",
    question: "Primary health data collected at outpatient departments (OPD) includes:",
    options: [
      { id: "q50a", text: "Staff monthly payroll logs" },
      { id: "q50b", text: "Patient registration, age, gender, and clinical diagnosis" },
      { id: "q50c", text: "Equipment purchasing quotes" },
      { id: "q50d", text: "Fuel expenditure records" },
    ],
    correctAnswer: "q50b",
  },
  {
    id: "q51",
    question: "In health data entry, what does data integrity ensure?",
    options: [
      { id: "q51a", text: "Rapid server rebooting" },
      { id: "q51b", text: "Accuracy, completeness, and consistency of medical records" },
      { id: "q51c", text: "Unlimited storage capacity" },
      { id: "q51d", text: "Public access to patient files" },
    ],
    correctAnswer: "q51b",
  },
  {
    id: "q52",
    question:
      "Which database concept uniquely identifies each record in a relational database table?",
    options: [
      { id: "q52a", text: "Foreign Key" },
      { id: "q52b", text: "Primary Key" },
      { id: "q52c", text: "Index Key" },
      { id: "q52d", text: "Candidate Key" },
    ],
    correctAnswer: "q52b",
  },
  {
    id: "q53",
    question:
      "What is the primary purpose of routine health data backup procedures in an HMIS setup?",
    options: [
      { id: "q53a", text: "To reduce internet bandwidth usage" },
      {
        id: "q53b",
        text: "To prevent permanent data loss in case of hardware failure or cyberattacks",
      },
      { id: "q53c", text: "To auto-generate statistical charts" },
      { id: "q53d", text: "To compress image files" },
    ],
    correctAnswer: "q53b",
  },
  {
    id: "q54",
    question:
      "Which software is widely utilized globally and in Pakistan for health management and indicators reporting?",
    options: [
      { id: "q54a", text: "AutoCAD" },
      { id: "q54b", text: "DHIS2" },
      { id: "q54c", text: "CorelDraw" },
      { id: "q54d", text: "SPSS Basic" },
    ],
    correctAnswer: "q54b",
  },
  {
    id: "q55",
    question:
      "In relational databases (e.g., MS Access/SQL), a single row in a table represents a:",
    options: [
      { id: "q55a", text: "Field / Attribute" },
      { id: "q55b", text: "Record / Tuple" },
      { id: "q55c", text: "Primary Key" },
      { id: "q55d", text: "Data Type" },
    ],
    correctAnswer: "q55b",
  },
  {
    id: "q56",
    question:
      "What is the shortcut key to permanently delete a selected file in Windows without moving it to the Recycle Bin?",
    options: [
      { id: "q56a", text: "Delete" },
      { id: "q56b", text: "Shift + Delete" },
      { id: "q56c", text: "Ctrl + Delete" },
      { id: "q56d", text: "Alt + Delete" },
    ],
    correctAnswer: "q56b",
  },
  {
    id: "q57",
    question: "Which standard port number is typically used by secure HTTPS traffic?",
    options: [
      { id: "q57a", text: "Port 80" },
      { id: "q57b", text: "Port 21" },
      { id: "q57c", text: "Port 443" },
      { id: "q57d", text: "Port 25" },
    ],
    correctAnswer: "q57c",
  },
  {
    id: "q58",
    question:
      "What is the term for converting readable plain text into an unreadable scrambled format to secure sensitive data?",
    options: [
      { id: "q58a", text: "Decryption" },
      { id: "q58b", text: "Compression" },
      { id: "q58c", text: "Encryption" },
      { id: "q58d", text: "Formatting" },
    ],
    correctAnswer: "q58c",
  },
  {
    id: "q59",
    question:
      "Which key is pressed to enter Safe Mode during the booting process in traditional Windows systems?",
    options: [
      { id: "q59a", text: "F2" },
      { id: "q59b", text: "F8" },
      { id: "q59c", text: "F12" },
      { id: "q59d", text: "Esc" },
    ],
    correctAnswer: "q59b",
  },
  {
    id: "q60",
    question:
      "Which utility command in Windows checks and repairs filesystem errors on a hard disk?",
    options: [
      { id: "q60a", text: "chkdsk" },
      { id: "q60b", text: "sfc /scannow" },
      { id: "q60c", text: "format" },
      { id: "q60d", text: "defrag" },
    ],
    correctAnswer: "q60a",
  },
];

function assertQuestionBank(questions: Question[]): void {
  const ids = new Set<string>();
  for (const question of questions) {
    if (ids.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}`);
    }
    ids.add(question.id);
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        throw new Error(`Duplicate option id ${option.id} on ${question.id}`);
      }
      optionIds.add(option.id);
      if (!option.text.trim()) {
        throw new Error(`Empty option text on ${question.id}`);
      }
    }
    if (!optionIds.has(question.correctAnswer)) {
      throw new Error(
        `correctAnswer ${question.correctAnswer} is not an option of ${question.id}`,
      );
    }
    if (!question.question.trim()) {
      throw new Error(`Empty question text on ${question.id}`);
    }
  }
}

assertQuestionBank(QUESTIONS);
