"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { MdLocationOn } from "react-icons/md";
import axios from "axios";
import BASE_URL from "../../utils/constant";
import { useRouter } from "next/navigation";

// Dynamically import the Map component to ensure it only runs on the client
const Map = dynamic(() => import("../../../components/Map"), { ssr: false });

const Index = () => {
  const router = useRouter();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [activeRadio, setActiveRadio] = useState("");
  const [breederList, setBreederList] = useState([]);
  const [userIdOrBreederId, setUserIdOrBreederId] = useState(null);
  const [filter, setFilter] = useState(null);
  const [location, setLocation] = useState(null);
  const [recentDate, setRecentDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchItemParam, setSearchItem] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const searchItemParam = queryParams.get('searchItem');
      setSearchItem(searchItemParam || '');  
    }
    const debounceTimeout = setTimeout(() => {
      if (!searchItemParam) return;

      const query = searchItemParam.toLowerCase();
      const filtered = breederList.filter((breeder) => {
        return (
          breeder.name?.toLowerCase().includes(query) ||
          breeder.location?.toLowerCase().includes(query)
        );
      });

      setFilteredData(filtered);
    }, 500); // Set the debounce delay to 500ms

    // Cleanup the timeout if the searchItem or dependencies change
    return () => clearTimeout(debounceTimeout);
  }, [searchItemParam, breederList]);

  useEffect(() => {
    getBreederList();
    if (filter === "nearby" && navigator.geolocation) {
      setRecentDate(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setActiveRadio("nearby");
        },
        () => alert("Unable to retrieve your location.")
      );
    }
    if (filter === "recent") {
      setLocation(null);
      const today = new Date().toISOString().split("T")[0];
      setRecentDate(today);
      setActiveRadio("recent");
    }

    if (activeRadio === "nearby" || activeRadio === "recent") {
      getBreederList();
    }
  }, [filter, activeRadio]);

  useEffect(() => {
    const userId = localStorage.getItem("user_user_id");
    const breederId = localStorage.getItem("breeder_user_id");
    if (userId) {
      setUserIdOrBreederId(userId);
    } else if (breederId) {
      setUserIdOrBreederId(breederId);
    }
  }, [userIdOrBreederId]);

  const getBreederList = async () => {
    const userId = localStorage.getItem("user_user_id");
    let apiURL = userId
      ? `${BASE_URL}/api/all_breeders_listing`
      : `${BASE_URL}/api/all_breeders_listing_without_login`;

    let apiData = {
      user_id: userId,
      recent: recentDate,
      latitude: location?.lat,
      longitude: location?.lon,
    };
    const response = await axios.post(apiURL, apiData);
    if (response.data.code === 200) {
      setBreederList(
        response.data.breeder
          ? response.data.breeder
          : response.data.all_breeders
      );
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value.length < 3) {
      setFilteredData([]);
    }
  };

  const handleSearch = (event) => {
    if (event) {
        event.preventDefault(); // Prevent page reload if triggered by a form submit
      }

    let filtered = breederList.filter((breeder) => {
      const query = searchQuery.toLowerCase();
  
      return (
        breeder.name?.toLowerCase().includes(query) ||
        breeder.location?.toLowerCase().includes(query) ||
        ""
      );
    });

    setFilteredData(filtered);
    
    if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
        setLocation({
          lat: filtered[0].latitude,
          lon: filtered[0].longitude,
        });
      }

  };
  

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  function handleModel() {
    setDropdownVisible(!isDropdownVisible);
  }

  return (
    <>
      <div className="pets-breeder-wrap">
        <div className="map-main-wrap">
          <div className="container">
            <div className="aligns-filter-pets">
              <div className="searchbar-filter-sec">
                <div className="search-wrap">
                <form onSubmit={() => handleSearch(event)}>
                    <label>
                        <input
                        type="text"
                        value={searchQuery}
                        onKeyDown={handleKeyDown}
                        onChange={handleSearchChange}
                        placeholder="Search by Animal Type, Breed or Location"
                        />
                        <button type="submit">
                        <Image
                            width={23}
                            height={23}
                            src="/images/Nextpet-imgs/all-icons/serch2.svg"
                            alt="search"
                        />
                        </button>
                    </label>
                    </form>
                </div>
              </div>
              <div className="search-filter-sec">
                <div className="pets-filters-wrap">
                  <div className="filter-sec">
                    <div className="quotes2">
                      <div className="dropdown-filterbtn" onClick={handleModel}>Sort
                        <Image width={23} height={23} src="/images/Nextpet-imgs/dashboard-imgs/mi_filter.svg" alt="filter"/>
                      </div>
                      <div className="dropdown-showfilter"
                           style={{
                            display: isDropdownVisible ? "block" : "none",
                          }}
                      >
                        <div className="quotes-list" >
                          <div className="filter-data-list">
                            <input 
                              type="radio"
                              name="exp_language2"
                              value="nearby"
                              checked={filter === "nearby"}
                              onChange={() => setFilter("nearby")}/>
                            <p>Nearby</p>
                          </div>

                          <div className="filter-data-list">
                            <input 
                              type="radio"
                              name="exp_language2"
                              value="recent"
                              checked={filter === "recent"}
                              onChange={() => setFilter("recent")}/>

                            <p>Recent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="location-filter">
                    <a style={{background: "#e49a01",}}>
                      <MdLocationOn className="fas fa-map-marker-alt"
                      style={{ color:'white', margin: "12px", cursor: "pointer" }}
                      size={20} />
                    </a>
                    <button type="button"  style={{background:'white'}} className="shadow-lg" onClick={() => router.push('/breeders')}>
                      <Image width={23} height={23} src="/images/Nextpet-imgs/all-icons/filter-map-icon.svg" alt="filter-map-icon"/></button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Map component */}
          <Map data={filteredData && filteredData.length > 0 ? filteredData : breederList} location={location} />

        </div>
    </div>
    </>
  );
};

export default Index;
