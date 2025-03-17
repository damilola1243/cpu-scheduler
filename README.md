# CPU Scheduling Simulator

A web-based tool to visualize and compare CPU scheduling algorithms.

## Table of Contents

-   [About](#about)
-   [Features](#features)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Running the Application](#running-the-application)
-   [Usage](#usage)
-   [Algorithms Implemented](#algorithms-implemented)
-   [MLFQ Configuration](#mlfq-configuration)
-   [Contributing](#contributing)
-   [License](#license)

## About

This project is a CPU scheduling simulator, built with React and Next.js, designed to provide a hands-on experience for understanding how different CPU scheduling algorithms impact process execution. It's a valuable tool for students, educators, and developers looking to visualize scheduling concepts.

## Features

-   **Process Generation:** Easily generate a customizable number of processes with randomized arrival times and burst times.
-   **Algorithm Comparison:** Directly compare the performance of FIFO, SJF, STCF, Round Robin (RR), and Multilevel Feedback Queue (MLFQ) algorithms.
-   **Visual Gantt Charts:** Gain visual insights into process execution timelines with interactive Gantt charts.
-   **Detailed Process Tables:** Inspect comprehensive process information and results in clear, sortable tables.
-   **MLFQ Configuration:** Fine-tune the MLFQ algorithm by adjusting time quanta for each queue and the boost interval.
-   **Responsive User Interface:** Enjoy a seamless experience on various screen sizes.

## Getting Started

### Prerequisites

-   Node.js (>= 18)
-   npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/damilola1243/cpu-scheduler.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd <your_project_directory>
    ```

3.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

```bash
npm run dev
# or
yarn dev
