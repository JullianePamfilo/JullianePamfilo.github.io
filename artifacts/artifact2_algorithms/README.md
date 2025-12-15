# Artifact 2: Algorithms and Data Structures

## Artifact Overview
This artifact is an enhanced version of the Course Planner application originally developed for CS 300: Analysis and Design. The program reads course data from a CSV file and allows users to load, search, and display course information through a command-line interface.

I selected this artifact because it clearly demonstrates my understanding of algorithms, data structures, and performance optimization.

## Original Implementation
The original implementation relied on basic data structures and provided limited efficiency for searching and ordering course data. While functional, it did not fully optimize for time complexity or scalability.

## Enhancements Made
For the enhanced version, I significantly improved the algorithmic design:

- Replaced linear searches with an `unordered_map` to achieve O(1) average-case lookup time
- Introduced a separate sorted vector of course IDs to maintain ordered output without sacrificing lookup efficiency
- Added input validation and string normalization to ensure consistent and accurate searches
- Improved code organization and clarity by separating responsibilities across functions

These changes improved both performance and code maintainability while preserving correct program behavior.

## Skills Demonstrated
- Algorithm analysis and optimization
- Effective use of data structures such as hash maps and vectors
- Time complexity evaluation and improvement
- Input validation and defensive programming
- Clean and readable C++ code design

## Course Outcomes Addressed
This artifact demonstrates the following CS 499 course outcomes:

- Analyze algorithms and data structures to determine efficiency and suitability
- Apply appropriate data structures to solve computational problems effectively
- Write efficient, well-structured, and maintainable code
- Communicate algorithmic decisions through clear documentation

## Reflection
Working on this enhancement deepened my understanding of how data structure selection directly affects performance. It reinforced the importance of analyzing time complexity and designing systems that balance efficiency with readability and maintainability.
