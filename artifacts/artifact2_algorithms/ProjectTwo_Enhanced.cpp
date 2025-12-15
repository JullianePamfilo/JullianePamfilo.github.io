// ProjectTwo.cpp - Enhanced Version for CS 499 Algorithms & Data Structure
// Author: Julliane Pamfilo
// Description:
// In this enhanced version of the course planner, I improved the data
// structures and algorithms by introducing an unordered_map for O(1)
// course lookup and a separate sorted vector of course IDs for ordered
// display. I also added input validation, string normalization, and
// clearer separation of responsibilities between functions.

#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <unordered_map>
#include <algorithm>
#include <cctype>
#include <stdexcept>

using namespace std;

// Structure to store course details
struct Course {
    string courseId;
    string title;
    vector<string> prerequisites;
};

// Helper: trim leading/trailing whitespace from a string
string Trim(const string& input) {
    size_t start = input.find_first_not_of(" \t\r\n");
    if (start == string::npos) {
        return "";
    }
    size_t end = input.find_last_not_of(" \t\r\n");
    return input.substr(start, end - start + 1);
}

// Helper: convert a string to uppercase
string ToUpper(const string& str) {
    string upperStr = str;
    transform(upperStr.begin(), upperStr.end(), upperStr.begin(),
              [](unsigned char c) { return static_cast<char>(toupper(c)); });
    return upperStr;
}

// Class that manages the course catalog using an unordered_map for fast lookups
class CourseCatalog {
public:
    // Load and parse the CSV file into the data structure
    void LoadFromFile(const string& filename);

    // Print all courses in alphanumeric order by courseId
    void PrintAllCourses() const;

    // Print full information for a single course
    void PrintCourse(const string& courseId) const;

    bool IsEmpty() const { return coursesById.empty(); }

private:
    unordered_map<string, Course> coursesById;
    vector<string> sortedCourseIds;

    void BuildSortedIndex();
};

void CourseCatalog::LoadFromFile(const string& filename) {
    coursesById.clear();
    sortedCourseIds.clear();

    ifstream file(filename);
    if (!file.is_open()) {
        throw runtime_error("Unable to open file: " + filename);
    }

    string line;
    while (getline(file, line)) {
        line = Trim(line);
        if (line.empty()) {
            continue; // skip blank lines
        }

        stringstream ss(line);
        string id, title;

        // The first field is the course ID
        if (!getline(ss, id, ',')) {
            continue; // malformed line; skip
        }
        id = ToUpper(Trim(id));

        // The second field is the title
        if (!getline(ss, title, ',')) {
            continue; // malformed line; skip
        }
        title = Trim(title);

        Course course;
        course.courseId = id;
        course.title = title;

        // Remaining fields are prerequisites
        string prereq;
        while (getline(ss, prereq, ',')) {
            prereq = ToUpper(Trim(prereq));
            if (!prereq.empty()) {
                course.prerequisites.push_back(prereq);
            }
        }

        // Insert or update the course in the map
        coursesById[id] = course;
    }

    file.close();
    BuildSortedIndex();
}

void CourseCatalog::BuildSortedIndex() {
    sortedCourseIds.clear();
    sortedCourseIds.reserve(coursesById.size());

    for (const auto& pair : coursesById) {
        sortedCourseIds.push_back(pair.first);
    }

    sort(sortedCourseIds.begin(), sortedCourseIds.end());
}

void CourseCatalog::PrintAllCourses() const {
    if (coursesById.empty()) {
        cout << "No course data loaded. Please load data first." << endl;
        return;
    }

    cout << "\nHere is a list of courses:\n" << endl;
    for (const auto& id : sortedCourseIds) {
        auto it = coursesById.find(id);
        if (it != coursesById.end()) {
            cout << it->second.courseId << ", " << it->second.title << endl;
        }
    }
    cout << endl;
}

void CourseCatalog::PrintCourse(const string& courseId) const {
    if (coursesById.empty()) {
        cout << "No course data loaded. Please load data first." << endl;
        return;
    }

    string normalizedId = ToUpper(Trim(courseId));
    auto it = coursesById.find(normalizedId);
    if (it == coursesById.end()) {
        cout << "Sorry, that course was not found." << endl;
        return;
    }

    const Course& course = it->second;

    cout << "\nCourse Information" << endl;
    cout << "------------------" << endl;
    cout << "Course: " << course.courseId << endl;
    cout << "Title:  " << course.title << endl;

    cout << "Prerequisites: ";
    if (course.prerequisites.empty()) {
        cout << "None";
    } else {
        for (size_t i = 0; i < course.prerequisites.size(); ++i) {
            cout << course.prerequisites[i];
            if (i + 1 < course.prerequisites.size()) {
                cout << ", ";
            }
        }
    }
    cout << "\n" << endl;
}

void DisplayMenu() {
    cout << "==========================" << endl;
    cout << "   Course Planner Menu    " << endl;
    cout << "==========================" << endl;
    cout << "  1. Load Data Structure" << endl;
    cout << "  2. Print Course List" << endl;
    cout << "  3. Print Course" << endl;
    cout << "  9. Exit" << endl;
    cout << "Please enter your choice: ";
}

int main() {
    CourseCatalog catalog;
    bool dataLoaded = false;
    int choice = 0;

    cout << "Welcome to the Course Planner." << endl;

    while (true) {
        DisplayMenu();
        if (!(cin >> choice)) {
            // If the user enters non-numeric input, clear and ignore
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid input. Please enter a number from the menu." << endl;
            continue;
        }

        if (choice == 9) {
            cout << "Thank you for using the Course Planner. Goodbye." << endl;
            break;
        }

        switch (choice) {
        case 1: {
            // Use the default file name from the original project
            const string filename = "courses.csv";
            try {
                catalog.LoadFromFile(filename);
                dataLoaded = true;
                cout << "Data loaded successfully from " << filename << ".\n" << endl;
            } catch (const exception& ex) {
                cout << "Error: " << ex.what() << endl;
            }
            break;
        }
        case 2:
            if (!dataLoaded) {
                cout << "Please load the data first (Option 1)." << endl;
            } else {
                catalog.PrintAllCourses();
            }
            break;
        case 3: {
            if (!dataLoaded) {
                cout << "Please load the data first (Option 1)." << endl;
            } else {
                cout << "Enter the course number (e.g., CSCI400): ";
                string courseId;
                cin >> courseId;
                catalog.PrintCourse(courseId);
            }
            break;
        }
        default:
            cout << "Invalid choice. Please select a valid menu option." << endl;
            break;
        }
    }

    return 0;
}
