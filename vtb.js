const customTransforms = {
  'test3': (obj, params) => {
    console.log(obj.src);
    console.log(obj.dst);
    console.log(params);
    return obj;
  },
  'getExtraFields': (obj, params) => {

    if (!obj.dst.extraFieldValues) return obj;

    obj.dst.nameTravelplan = obj.dst.darkMode = '';

    obj.dst.extraFieldValues.forEach((extraField) => {

      extraField.fields.forEach((field) => {

        switch(field.name) {
          case 'name_travelplan': obj.dst.nameTravelplan = field.value;
            break;
          case 'dark_mode': obj.dst.darkMode = field.value !== undefined ? field.value : false;
            break;
        }
      });
    });
    
    return obj;
  },
  'coverImage':(obj, params) => {

    let i = 0;
    obj.dst.cover.forEach((c) => {
      
      obj.dst.cover[i].url = c.url.replace('medium', 'large');

      i++;
    });

    return obj;
  },
  'removeolPrices': (obj, params) => {

    obj.dst.segments.forEach((segment) => {

      segment.elements.forEach((element) => {
        delete element.olPrices;
      });

    });

    return obj;
  },
  'getMapData': (obj, params) => {

    // let markers = [];
    // for (const seg of obj.dst.segments) {
    //   for (const element of seg.elements) {
    //     if (element.maps) {
    //       if (element.maps.latitude) {
    //         markers.push(element.maps)
    //       }
    //     }
    //   }
    // }
    // obj.dst.markers = markers;
    // return obj;
    let atoz = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let i = -1; 
    let prevIsDeafult = false;
    let mapPoints = [];
    obj.dst.segments.forEach((segment) => {


      if(segment.typeId == 1) {
      
        if(prevIsDeafult == false) {
          i++;
          if(segment.maps != undefined) {
            mapPoints.push(segment.maps);
          }
        }
        segment.iconChar = atoz[i];
        prevIsDeafult = true;
        //
      } else {
        prevIsDeafult = false;
      }
      
    });
    //console.log('mapPoints', mapPoints);
    i = 0;
    let waypoints = waypointsConfig = [];
    mapPoints.forEach((map) => {
      if(i == 0) {
        
        obj.dst.lat = mapPoints[i].latitude;
        obj.dst.lng = mapPoints[i].longitude;
        obj.dst.origin = { lat: mapPoints[i].latitude, lng: mapPoints[i].longitude };

      } else if (mapPoints.length -1 == i) {
        
        waypoints.push({
          location: { lat: mapPoints[i].latitude, lng: mapPoints[i].longitude },
          stopover: false,
        });

        waypointsConfig.push({
          infoWindow: `<h4>A<h4>
            <a href='http://google.com' target='_blank'>A</a>
            `,
          icon: 'http://i.imgur.com/7teZKif.png',
        });
        
      } else {
        
        obj.dst.destination = { lat: mapPoints[i].latitude, lng: mapPoints[i].longitude };
      }
      i++;
    });

    obj.dst.renderOptions = {
      suppressMarkers: true,
    };

    
    
    obj.dst.waypoints = waypoints;
    
    obj.dst.markerOptions = {
      origin: {
        infoWindow: 'Origin.',
        icon: 'http://media.wwtg.nl/original/original/map-pin-nieuw.png',
      },
      waypoints: waypointsConfig,
      destination: {
        infoWindow: 'Destination',
        icon: 'http://i.imgur.com/7teZKif.png',
      },
    };

    obj.dst.mapPoints = mapPoints;
    return obj;


  },
  'getFlightData': (obj, params) => {

    let onceTimeExecution = false;
    let flights = {};
    let flightDetails  = [];
    obj.dst.segments.forEach((segment) => {

      if(segment.typeId == 4 && segment.isFlight) {

        segment.flightInfo.forEach((flight) => {
        
          if(onceTimeExecution == false) {

            flights.firstDepartureAirport = flight.departureAirportObject.description !== undefined ? flight.departureAirportObject.description:flight.departureAirport;
            flights.firstArrivalAirport = flight.arrivalAirportObject.description !== undefined ? flight.arrivalAirportObject.description:flight.arrivalAirport;
            flights.firstArrivalDate = flight.arrivalDate;
            flights.firstDepartureDate = flight.departureDate;
            
            onceTimeExecution = true;
          }

          flights.lastDepartureAirport = flight.departureAirportObject.description !== undefined ? flight.departureAirportObject.description:flight.departureAirport;
          flights.lastArrivalAirport = flight.arrivalAirportObject.description !== undefined ? flight.arrivalAirportObject.description:flight.arrivalAirport;
          flights.lastArrivalDate = flight.arrivalDate;
          flights.lastDepartureDate = flight.departureDate;


          let data = {
                      airlineCode: flight.airlineCode, 
                      flightNumber: flight.flightNumber, 
                      departureAirport: flight.departureAirportObject.description !== undefined ? flight.departureAirportObject.description:flight.departureAirport, 
                      departureDate: flight.departureDate, 
                      departureTime: flight.departureTime,
                      arrivalAirport: flight.arrivalAirportObject.description !== undefined ? flight.arrivalAirportObject.description:flight.arrivalAirport, 
                      arrivalDate: flight.arrivalDate, 
                      arrivalTime: flight.arrivalTime
                    };
          flightDetails.push(data);
        });

      }

    });

    console.log('flights', flights);
    console.log('flightDetails', flightDetails);

    obj.dst.flightDetails = flightDetails;
    obj.dst.flights = flights;
    return obj;
  },
  'getBookedBy':(obj, params) => {

    obj.dst.contactName = obj.dst.contactImage = obj.dst.contactEmail = obj.dst.contactText = '';

    if (!obj.dst.TSOrder.bookedByInfo) return obj;

    if(obj.dst.TSOrder.bookedByInfo.name || obj.dst.TSOrder.bookedByInfo.surname) {
      obj.dst.contactName = obj.dst.TSOrder.bookedByInfo.name + ' ' + obj.dst.TSOrder.bookedByInfo.surname;
    }
  
    if(obj.dst.TSOrder.bookedByInfo.signature) {

      let contactSignature = obj.dst.TSOrder.bookedByInfo.signature;

      obj.dst.contactImage = contactSignature.match(/<image>(.*?)<\/image>/)[1];
      obj.dst.contactEmail = contactSignature.match(/<contact>(.*?)<\/contact>/)[1];
      obj.dst.contactText = contactSignature.match(/<text>(.*?)<\/text>/)[1];

    }

    return obj;

  },
  'getIntroMedia':(obj, params) => {

    let introMedia = [];
    obj.dst.intoContent = '';
    obj.dst.segments.forEach((segment) => {

      if(segment.typeId == 18) {
        segment.media.forEach((image) => {
          image.url = image.url.replace('wordpress', 'original');
          image.url = image.url.replace('medium', 'original');

          introMedia.push(image.url);
        });

        obj.dst.intoContent = segment.content !== undefined?segment.content:'';

        segment.elements.forEach((element) => {
          element.media.forEach((image) => {
            image.url = image.url.replace('wordpress', 'original');
            image.url = image.url.replace('medium', 'original');

            introMedia.push(image.url);
          });
        });
      }
    });
    obj.dst.introMedia = introMedia;
    return obj;
  },
  'getUSPData':(obj, params) => {

    let uspData = [];
    obj.dst.segments.forEach((segment) => {

      if(segment.typeId == 19) {

        segment.elements.forEach((element) => {

          if(element.media[0] !== undefined) {
            uspData.push({ image: element.media[0].url, text: element.additionalText !== undefined ? element.additionalText : '' });
          }

        });
      }
    });
    obj.dst.uspData = uspData;
    return obj;
  },
  'formatSegment':(obj, params) => {

    let accommodations = [];
    obj.dst.segments.forEach((segment) => {

      let images = [];

      if(segment.media[0] !== undefined) {
        segment.media.forEach((med) => {
          med.url = med.url.replace('medium', 'large');
          images.push(med.url);
        });
        
      }

      segment.elements.forEach((element) => {
        
        if(element.unitId == 2) {
          accommodations.push(element);
        }

        if(element.media[0] !== undefined) {
          element.media.forEach((med) => {
            med.url = med.url.replace('medium', 'large');
            images.push(med.url);
          });
          
        }

        element.TSOrderline.extraFieldValues.forEach((extra) => {

          if(extra.name=='orderline_highlight' && extra.value == true) {

            element.orderline_highlight = true;
            console.log('element', element);
          }

        });

      });

      
      // if(images.length >= 5) {
      //   images[2] = images[2].replace('medium', 'large');
      // }

      // if(images.length == 3 || images.length == 4) {
      //   images[0] = images[0].replace('medium', 'large');
      // }

      if(segment.typeId != 18) {
        segment.media.forEach((image) => {
          
          image.url = image.url.replace('medium', 'large');

        });

        segment.elements.forEach((element) => {
          element.media.forEach((image) => {
            
            image.url = image.url.replace('medium', 'large');
            console.log('image.url', image.url);
          });
        });
      }

      

      segment.images = images;
      
    });

    obj.dst.accommodations = accommodations;

    return obj;
  }
};

module.exports = customTransforms;
