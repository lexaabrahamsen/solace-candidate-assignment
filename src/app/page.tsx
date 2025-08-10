"use client";

import { useEffect, useState } from "react";

type Advocate = {
  id?: string;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
};

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadAdvocates = async () => {
      try {
        const response = await fetch("/api/advocates");
        const jsonResponse: { data?: Advocate[] } = await response.json();
        const loadAdvocates: Advocate[] = jsonResponse.data ?? [];
        setAdvocates(loadAdvocates);
        setFilteredAdvocates(loadAdvocates);
      } catch (error) {
        console.error("Error fetching advocates:", error);
        setAdvocates([]);
        setFilteredAdvocates([]);
      }
    };

    loadAdvocates();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    console.log("searching for:", newSearchTerm);
    setSearchTerm(newSearchTerm);

    const normalizedSearchTerm = newSearchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      setFilteredAdvocates(advocates);
      return;
    }

    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.lastName.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.city.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.degree.toLowerCase().includes(normalizedSearchTerm) ||
        advocate.specialties.some((s) => s.toLowerCase().includes(normalizedSearchTerm)) ||
        advocate.yearsOfExperience.toString().includes(normalizedSearchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const handleResetClick = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input
          style={{ border: "1px solid black" }}
          onChange={handleSearchChange}
          value={searchTerm}
          placeholder="Search by first name, last name, city, degree, specialties, or years
          of experience"
          aria-label="Search Advocates"
        />
        <button onClick={handleResetClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr key={advocate.id}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s) => (
                    <div key={advocate.id}>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}