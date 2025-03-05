export const mockCollegeDetails = {
  stanford: {
    id: "stanford",
    name: "Stanford University",
    heroImage: "https://images.unsplash.com/photo-1581362072978-14998d01fdaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    location: {
      city: "Stanford",
      state: "CA",
      nearestCity: "San Francisco"
    },
    type: "Private Research University",
    rating: {
      score: 4.8,
      reviewCount: 1245
    },
    ranking: {
      usNews: 6
    },
    size: {
      category: "Medium",
      students: 17249
    },
    majors: [
      "Computer Science",
      "Engineering",
      "Biology",
      "Economics",
      "Political Science",
      "Psychology",
      "Mathematics",
      "Physics",
      "Chemistry",
      "History",
      "English",
      "Philosophy",
      "Sociology",
      "Anthropology",
      "Art",
      "Music"
    ],
    acceptance: {
      rate: "4%",
      internationalStudents: "12%",
      yourChances: "Extreme Reach",
      byMajor: {
        "Engineering": "3.2%",
        "Computer Science": "2.8%",
        "Business": "4.5%",
        "Liberal Arts": "5.1%"
      }
    },
    academics: {
      gpaRange: {
        min: 3.8,
        max: 4.0
      },
      satRange: {
        min: 1440,
        max: 1570
      },
      actRange: {
        min: 32,
        max: 35
      }
    },
    qualityOfLife: {
      factors: [
        {
          name: "Campus Facilities",
          score: 9.5
        },
        {
          name: "Housing",
          score: 9.2
        },
        {
          name: "Dining",
          score: 8.9
        },
        {
          name: "Safety",
          score: 9.7
        },
        {
          name: "Social Life",
          score: 9.0
        },
        {
          name: "Location",
          score: 9.8
        }
      ],
      description: "Stanford University offers an exceptional quality of life with its beautiful campus, Mediterranean climate, and proximity to Silicon Valley. Students enjoy state-of-the-art facilities, diverse dining options, and a vibrant campus community with over 600 student organizations."
    },
    costs: {
      items: [
        {
          name: "Tuition",
          inState: "$56,169",
          outOfState: "$56,169"
        },
        {
          name: "Room & Board",
          inState: "$17,860",
          outOfState: "$17,860"
        },
        {
          name: "Books & Supplies",
          inState: "$1,350",
          outOfState: "$1,350"
        },
        {
          name: "Personal Expenses",
          inState: "$2,700",
          outOfState: "$2,700"
        },
        {
          name: "Transportation",
          inState: "$1,500",
          outOfState: "$1,500"
        }
      ],
      total: {
        inState: "$79,579",
        outOfState: "$79,579"
      },
      notes: "Stanford meets 100% of demonstrated financial need for all admitted domestic students. About 70% of students receive some form of financial aid, with an average need-based scholarship of $52,030."
    },
    recruiting: {
      employmentRate: "94%",
      startingSalary: "$95,000",
      salaryAfterYears: {
        years: 5,
        amount: "$145,000"
      },
      topIndustries: [
        {
          name: "Technology",
          percentage: "35%"
        },
        {
          name: "Finance",
          percentage: "20%"
        },
        {
          name: "Consulting",
          percentage: "15%"
        }
      ],
      graduateSchool: {
        rate: "38%"
      }
    }
  },
  harvard: {
    id: "harvard",
    name: "Harvard University",
    heroImage: "https://images.unsplash.com/photo-1605806616949-59450419c3a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    location: {
      city: "Cambridge",
      state: "MA",
      nearestCity: "Boston"
    },
    type: "Private Ivy League University",
    rating: {
      score: 4.9,
      reviewCount: 1532
    },
    ranking: {
      usNews: 3
    },
    size: {
      category: "Medium",
      students: 21000
    },
    majors: [
      "Economics",
      "Political Science",
      "Computer Science",
      "Biology",
      "History",
      "Mathematics",
      "Psychology",
      "English",
      "Social Studies",
      "Chemistry",
      "Physics",
      "Philosophy",
      "Sociology",
      "Government",
      "Statistics"
    ],
    acceptance: {
      rate: "3.4%",
      internationalStudents: "14%",
      yourChances: "Extreme Reach",
      byMajor: {
        "Economics": "3.1%",
        "Computer Science": "2.9%",
        "Political Science": "3.5%",
        "Liberal Arts": "4.2%"
      }
    },
    academics: {
      gpaRange: {
        min: 3.9,
        max: 4.0
      },
      satRange: {
        min: 1460,
        max: 1580
      },
      actRange: {
        min: 33,
        max: 36
      }
    },
    qualityOfLife: {
      factors: [
        {
          name: "Campus Facilities",
          score: 9.6
        },
        {
          name: "Housing",
          score: 9.0
        },
        {
          name: "Dining",
          score: 9.2
        },
        {
          name: "Safety",
          score: 9.5
        },
        {
          name: "Social Life",
          score: 8.8
        },
        {
          name: "Location",
          score: 9.7
        }
      ],
      description: "Harvard offers a historic campus in Cambridge with easy access to Boston. The university provides diverse housing options, excellent dining facilities, and a rich array of extracurricular activities. Students benefit from world-class libraries, museums, and research facilities."
    },
    costs: {
      items: [
        {
          name: "Tuition",
          inState: "$54,768",
          outOfState: "$54,768"
        },
        {
          name: "Room & Board",
          inState: "$19,502",
          outOfState: "$19,502"
        },
        {
          name: "Books & Supplies",
          inState: "$1,000",
          outOfState: "$1,000"
        },
        {
          name: "Personal Expenses",
          inState: "$3,500",
          outOfState: "$3,500"
        },
        {
          name: "Transportation",
          inState: "$0-$4,000",
          outOfState: "$0-$4,000"
        }
      ],
      total: {
        inState: "$78,770-$82,770",
        outOfState: "$78,770-$82,770"
      },
      notes: "Harvard's financial aid program is entirely need-based, with no merit scholarships. Families with incomes below $75,000 typically pay nothing toward the cost of their child's education."
    },
    recruiting: {
      employmentRate: "89%",
      startingSalary: "$92,000",
      salaryAfterYears: {
        years: 5,
        amount: "$140,000"
      },
      topIndustries: [
        {
          name: "Finance",
          percentage: "30%"
        },
        {
          name: "Consulting",
          percentage: "25%"
        },
        {
          name: "Technology",
          percentage: "15%"
        }
      ],
      graduateSchool: {
        rate: "45%"
      }
    }
  },
  michigan: {
    id: "michigan",
    name: "University of Michigan",
    heroImage: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    location: {
      city: "Ann Arbor",
      state: "MI",
      nearestCity: "Detroit"
    },
    type: "Public Research University",
    rating: {
      score: 4.6,
      reviewCount: 1876
    },
    ranking: {
      usNews: 23
    },
    size: {
      category: "Large",
      students: 48090
    },
    majors: [
      "Business",
      "Engineering",
      "Computer Science",
      "Psychology",
      "Economics",
      "Biology",
      "Political Science",
      "Communications",
      "Nursing",
      "English",
      "Mathematics",
      "History",
      "Chemistry",
      "Sociology",
      "Anthropology"
    ],
    acceptance: {
      rate: "20%",
      internationalStudents: "8%",
      yourChances: "Target",
      byMajor: {
        "Engineering": "15%",
        "Business": "12%",
        "Computer Science": "14%",
        "Liberal Arts": "25%"
      }
    },
    academics: {
      gpaRange: {
        min: 3.7,
        max: 4.0
      },
      satRange: {
        min: 1340,
        max: 1530
      },
      actRange: {
        min: 31,
        max: 34
      }
    },
    qualityOfLife: {
      factors: [
        {
          name: "Campus Facilities",
          score: 9.2
        },
        {
          name: "Housing",
          score: 8.5
        },
        {
          name: "Dining",
          score: 8.7
        },
        {
          name: "Safety",
          score: 9.0
        },
        {
          name: "Social Life",
          score: 9.5
        },
        {
          name: "Location",
          score: 9.0
        }
      ],
      description: "The University of Michigan offers a vibrant campus life in the college town of Ann Arbor. Students enjoy excellent recreational facilities, a strong athletics culture, and a diverse array of student organizations. The campus features modern academic buildings, libraries, and research centers."
    },
    costs: {
      items: [
        {
          name: "Tuition",
          inState: "$16,178",
          outOfState: "$53,232"
        },
        {
          name: "Room & Board",
          inState: "$12,592",
          outOfState: "$12,592"
        },
        {
          name: "Books & Supplies",
          inState: "$1,048",
          outOfState: "$1,048"
        },
        {
          name: "Personal Expenses",
          inState: "$2,454",
          outOfState: "$2,454"
        },
        {
          name: "Transportation",
          inState: "$1,048",
          outOfState: "$1,048"
        }
      ],
      total: {
        inState: "$33,320",
        outOfState: "$70,374"
      },
      notes: "The University of Michigan offers need-based financial aid and merit scholarships. About 65% of students receive some form of financial assistance."
    },
    recruiting: {
      employmentRate: "92%",
      startingSalary: "$70,000",
      salaryAfterYears: {
        years: 5,
        amount: "$110,000"
      },
      topIndustries: [
        {
          name: "Business",
          percentage: "25%"
        },
        {
          name: "Engineering",
          percentage: "20%"
        },
        {
          name: "Healthcare",
          percentage: "15%"
        }
      ],
      graduateSchool: {
        rate: "32%"
      }
    }
  },
  washington: {
    id: "washington",
    name: "University of Washington",
    heroImage: "https://images.unsplash.com/photo-1574454941087-7e91daa79c88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    location: {
      city: "Seattle",
      state: "WA"
    },
    type: "Public Research University",
    rating: {
      score: 4.5,
      reviewCount: 1654
    },
    ranking: {
      usNews: 55
    },
    size: {
      category: "Large",
      students: 47400
    },
    majors: [
      "Computer Science",
      "Engineering",
      "Business",
      "Biology",
      "Psychology",
      "Communications",
      "Economics",
      "Political Science",
      "Nursing",
      "Mathematics",
      "Chemistry",
      "English",
      "History",
      "Sociology",
      "Environmental Science"
    ],
    acceptance: {
      rate: "56%",
      internationalStudents: "9%",
      yourChances: "Likely",
      byMajor: {
        "Engineering": "25%",
        "Computer Science": "20%",
        "Business": "35%",
        "Liberal Arts": "65%"
      }
    },
    academics: {
      gpaRange: {
        min: 3.5,
        max: 3.9
      },
      satRange: {
        min: 1220,
        max: 1470
      },
      actRange: {
        min: 27,
        max: 33
      }
    },
    qualityOfLife: {
      factors: [
        {
          name: "Campus Facilities",
          score: 9.0
        },
        {
          name: "Housing",
          score: 8.2
        },
        {
          name: "Dining",
          score: 8.5
        },
        {
          name: "Safety",
          score: 8.7
        },
        {
          name: "Social Life",
          score: 8.8
        },
        {
          name: "Location",
          score: 9.5
        }
      ],
      description: "The University of Washington offers a beautiful campus in Seattle with views of Mount Rainier. Students enjoy access to urban amenities, outdoor recreation, and a thriving tech industry. The campus features modern facilities, including research centers, libraries, and recreational spaces."
    },
    costs: {
      items: [
        {
          name: "Tuition",
          inState: "$12,076",
          outOfState: "$40,086"
        },
        {
          name: "Room & Board",
          inState: "$14,371",
          outOfState: "$14,371"
        },
        {
          name: "Books & Supplies",
          inState: "$900",
          outOfState: "$900"
        },
        {
          name: "Personal Expenses",
          inState: "$2,265",
          outOfState: "$2,265"
        },
        {
          name: "Transportation",
          inState: "$1,386",
          outOfState: "$1,386"
        }
      ],
      total: {
        inState: "$30,998",
        outOfState: "$59,008"
      },
      notes: "The University of Washington offers various financial aid options, including need-based grants, merit scholarships, and work-study opportunities. About 60% of undergraduates receive some form of financial aid."
    },
    recruiting: {
      employmentRate: "88%",
      startingSalary: "$68,000",
      salaryAfterYears: {
        years: 5,
        amount: "$105,000"
      },
      topIndustries: [
        {
          name: "Technology",
          percentage: "30%"
        },
        {
          name: "Healthcare",
          percentage: "20%"
        },
        {
          name: "Business",
          percentage: "15%"
        }
      ],
      graduateSchool: {
        rate: "28%"
      }
    }
  }
}; 