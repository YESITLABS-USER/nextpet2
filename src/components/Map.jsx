"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Dynamically import the MapContainer and other components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const StoreMap = ({ data, location }) => {
  const router = useRouter();
  const stores = data || [];
  const [isBreeder, setIsBreeder] = useState(false);

  useEffect(() => {
    const path = window.location.pathname; 
    if (path === '/map-breeder') { 
      setIsBreeder(true);
    } else {
      setIsBreeder(false);
    }
  }, []); 
  

  const [center, setCenter] = useState([40.7128, -74.0060]); // Default to New York City
  const [zoomed, setZoomed] = useState(2)

  useEffect(() => {
    if (location) {
      const { lat, lon } = location;
      setCenter([lat, lon]);
      setZoomed(10)
    } 
  }, [location, data]);

  return (
    <div style={{ height: "90vh" }}>
      <MapContainer center={center} zoom={zoomed} style={{ width: "100%", height: "100%" }} key={center.join(",")}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {stores.length > 0 &&
          stores.map((store) => {
            // Create a custom icon for each store
            const storeIcon = new L.Icon({
              iconUrl: "/images/Nextpet-imgs/location-icon.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            return (
              <Marker
                key={store.id}
                position={[
                  store.latitude && store.latitude !== "null" ? store.latitude : "28.5665",
                  store.longitude && store.longitude !== "null" ? store.longitude : "77.3039",
                ]}
                icon={storeIcon}
              >
                <Popup>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: "200px",
                    }}
                  >
                    <Image
                    src={ Array.isArray(store?.image) && store.image.length > 0 ? store.image[0] : store?.image || "/images/Nextpet-imgs/contact-default.webp"}                      
                      alt="profile"
                      width={40}
                      height={40}
                      style={{ borderRadius: "50%" }}
                    />
                    <div style={{ color: "#e49a01", fontWeight: "bold", padding: "0" }}>
                      {store?.name} {store?.type && `(${store?.type})`}
                    </div>
                    <div>{store?.breed && store?.breed}</div>
                    <button
                      style={{
                        color: "white",
                        background: "#e49a01",
                        padding: "4px 8px",
                        borderRadius: "20px",
                        fontSize: "10px",
                        border: "#e49a01",
                      }}
                      onClick={() =>
                      {isBreeder ? router.push(`/user/breeder-profile/${store?.breeder_id}/${store?.like_colour}`) : 
                        router.push(`/user/posts/${store?.user_breeder_id}/${store?.id}/${store?.check_like}`) }
                      }
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default StoreMap;




{/* <div style={{ display: "flex", flexDirection: "column", gap:"5px", justifyContent:"center", alignItems: "center", minWidth:"200px"}}>
                  <Image src={store?.image[0] ||"/images/Nextpet-imgs/contact-default.webp"} alt="profile" width={40} height={40} style={{ borderRadius: "50%"}}/>
                  
                  <div style={{ color: '#e49a01', fontWeight: "bold", padding: "0" }}>
                    {store.name}
                  </div>
                  <div className="flex gap-1 py-1">
                    <FaStar style={{ color: "green", marginBottom: "4px", }} />
                    <FaStar style={{ color: "green", marginBottom: "4px", }} />
                    <FaStar style={{ color: "green", marginBottom: "4px", }} />
                    <FaStar style={{ color: "green", marginBottom: "4px", }} />
                    <FaStar style={{ color: "gray", marginBottom: "4px", }} />
                  </div>

                  <button style={{ color: "white", background:"#e49a01", padding: "4px 8px", borderRadius:"20px", fontSize: "10px", border: "#e49a01"}} onClick={() => {router.push(`/user/posts/${store?.user_breeder_id}/${store?.id}/${store?.check_like}`)}}> View Details </button>
                </div> */}