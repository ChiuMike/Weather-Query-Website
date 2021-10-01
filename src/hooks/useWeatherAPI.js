import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

const fetchCurrentWeather=({ authorizationKey, locationName })=>{
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`)
    .then((response)=>response.json()).then((data)=>{
      const locationData=data.records.location[0];
      const weatherElements=locationData.weatherElement.reduce(
        (needElements,item)=>{
          if(['WDSD','TEMP'].includes(item.elementName)){
            needElements[item.elementName]=item.elementValue;
          }
          return needElements;
        },{}
      );
      return{
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        isLoading:false,
      }; 
    });
  };
  
  const fetchWeatherForecast=({ authorizationKey, cityName })=>{
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)
    .then((response)=>response.json()).then((data)=>{
      const locationData=data.records.location[0];
      const weatherElements=locationData.weatherElement.reduce(
        (needElements,item)=>{
          if(["Wx","PoP","CI"].includes(item.elementName)){
            needElements[item.elementName]=item.time[0].parameter;
          }
          return needElements;
        },{}
      );
      console.log("WeatherCode=",weatherElements.Wx.parameterValue)
      return{
        description:weatherElements.Wx.parameterName,
        weatherCode:weatherElements.Wx.parameterValue,
        rainPossibility:weatherElements.PoP.parameterName,
        comfortability:weatherElements.CI.parameterName,
      };
    });
  };

const useWeatherAPI=({locationName, cityName, authorizationKey})=>{
    const [weatherElement,setWeatherElement]=useState({
        locationName:'',
        description:'',
        temperature:0,
        windSpeed:0,
        rainPossibility:0,
        observationTime:new Date(),
        isLoading:true,
        comfortability:"",
        weatherCode:0,
    });

    const fetchData=useCallback(async ()=>{
        setWeatherElement((prevState)=>({
          ...prevState,
          isLoading:true, 
        }));
        const data=await Promise.all([
            fetchCurrentWeather({ authorizationKey, locationName }),
            fetchWeatherForecast({ authorizationKey, cityName }),]);
        const [currentWeather,weatherForecast]=data;

        setWeatherElement({
          ...currentWeather,
          ...weatherForecast,
          isLoading:false,
        });
    },[authorizationKey, cityName, locationName]);
    
    useEffect(()=>{
        fetchData();
    },[fetchData]);

    return [weatherElement,fetchData];
      
}

export default useWeatherAPI;