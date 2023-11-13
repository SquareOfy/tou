import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import { Thumb } from "./EmblaCarouselThumbsButton";
import imageByIndex from "./imageByIndex";
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import Modal from './EmblaModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/sharp-light-svg-icons";

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
  thumbnails: any[];
};

type MapContainerProps = {
  center: {
    lat: number;
    lng: number;
  };
};

const mapStyles: Array<google.maps.MapTypeStyle> =
[
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#523735"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#c9b2a6"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#dcd2be"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ae9e90"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#93817c"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5b076"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#447530"
      }
    ]
  },
  {
    "featureType": "road",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f1e6"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdfcf8"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f8c967"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e9bc62"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e98d58"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#db8555"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#806b63"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8f7d77"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ebe3cd"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dfd2ae"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#b9d3c2"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#92998d"
      }
    ]
  }
];

const MapContainer: React.FC<MapContainerProps> = ({ center }) => {
  const containerStyle = {
    width: '100%',
    height: '350px',
  };
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is not defined.');
    return null; // 또는 에러 처리를 할 수 있는 다른 방식으로 수정
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        options={{
          styles: mapStyles,
          mapTypeControl: false, // 지도 or 위성 버튼
          zoomControl: true, // 줌 버튼
          streetViewControl: false, // 스트릿뷰 버튼
          fullscreenControl: false, // 전체화면 버튼
        }}

      >
        <MarkerF 
          position={center} 
          icon={{
            url: "/11.png",
            // scaledSize: new google.maps.Size(40, 40),
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
};

// 현위치 구글맵 API
// const MapLocation: React.FC = (thumbnails) => {
//   const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

//   const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
//   // 위치 정보 받아오기
//   // 지금은 버튼인데 그냥 useEffect에 박으면 현위치 바로 가져올듯

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentLocation({ lat: latitude, lng: longitude });
//         },
//         (error) => {
//           console.error('Error getting current location:', error);
//         }
//       );
//     } else {
//       console.error('Geolocation is not supported by this browser.');
//     }
//   }, [])

//   if (!apiKey) {
//     console.error('Google Maps API key is not defined.');
//     return null; // 또는 에러 처리를 할 수 있는 다른 방식으로 수정
//   }

//   return (
//     <div>
//       <LoadScript googleMapsApiKey={apiKey}>
//         <GoogleMap
//           mapContainerStyle={{ width: '100%', height: '400px' }}
//           center={currentLocation}
//           zoom={15}
//           options={{
//             styles: mapStyles,
//           }}
//         >
//           <Marker position={currentLocation} />
          
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// };

const EmblaCarousel: React.FC<PropType> = ({ slides, options, thumbnails }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  // 모달 관련
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 모달 함수
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }

    setTimeout(() => {
      if (thumbnails[3] && ( // thumbnails[3]가 존재하는 경우에만 실행
        Math.abs(currentLocation.lat - thumbnails[3].latitude) > 0.01 || 
        Math.abs(currentLocation.lng - thumbnails[3].longitude) > 0.01)) {
          setIsModalOpen(true);
          console.log("모달상태"+isModalOpen);
      }
    }, 1000);
  }, [thumbnails])

  // 모달 내용을 조건부로 설정
  const modalContent = thumbnails[3] && ( // thumbnails[3]가 존재하는 경우에만 실행
    Math.abs(currentLocation.lat - thumbnails[3].latitude) > 0.01 || 
    Math.abs(currentLocation.lng - thumbnails[3].longitude) > 0.01
  ) ? (
    // 경고창이 뜰 경우
    <div style={{textAlign: "center"}}>
      {/* <img src='../../../pulic/alertModal.png' alt="" />
      <img src='../../../../pulic/alertModal.png' alt="" />
      <img src='../../pulic/alertModal.png' alt="" /> */}
      <div style={{textAlign: "end", cursor: "pointer"}}>
        <FontAwesomeIcon icon={faXmark} onClick={closeModal} style={{fontSize: "30px"}}/>
      </div>
      <img src='/alertModal.png' alt="" style={{width: "170px"}}/>
      <p>복제/위변조로 의심되는 상품입니다.</p>
    </div>
  ) : (
    // 경고창 안뜰경우
    null
  );

  return (
    <div className="embla">
      {/* 케러셀 구글맵 API */}
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">

          {thumbnails.map((thumbnail, index) => (
            <div key={index} className="embla__slide">
              <div className="embla__slide__number">
                <span>{index + 1}</span>
              </div>
              <MapContainer
                key={index}
                center={{
                  lat: thumbnail.latitude,
                  lng: thumbnail.longitude,
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* 현 위치 구글맵 API */}
      {/* <MapLocation /> */}

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        modalType={"type1"}
      >

        {modalContent}
      </Modal>
      
      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {thumbnails.map((thumbnail, index) => (
              <Thumb
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                index={index}
                branchName={thumbnail.branchName}
                branchLocation={thumbnail.branchLocation}
                branchType={thumbnail.branchType}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;