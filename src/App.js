import logo from './logo.svg';
import './App.css';
import React from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { useState,useEffect,useCallback,useMemo } from 'react';
import { getMoment } from './utils/helpers';
import WeatherCard from './views/WeatherCard';
import useWeatherAPI from './hooks/useWeatherAPI';
import WeatherSetting from './views/WeatherSetting';
import {findLocation} from './utils/helpers';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};                                                                                       
  height: 100%;
  display: flex;
  align-items: center; 
  justify-content: center; 
`;

const AUTHORIZATION_KEY = 'CWB-0B5EC65C-E060-4E55-96B4-CBD8E27F46E1';

const App = () => {
  const [currentTheme,setCurrentTheme]=useState('light');

  const handleCityChange=(currentCity)=>{ //定義一個可以用來切換WeatherCard與WeatherSetting的方法
    setCurrentCity(currentCity);
  }

  //定義一個state用來決定要切換成哪一個頁面
  const [currentPage,setCurrentPage]=useState('WeatherCard');
  const handleCurrentPageChange=(currentPage)=>{
    setCurrentPage(currentPage);
  }

  //讓使用者可以自行設定設定地區:
  const storageCity=localStorage.getItem('cityName')||"臺北市";
  const [currentCity,setCurrentCity]=useState(storageCity);
  //{cityName:"臺北市",locationName:"臺北",sunriseCityName="臺北市"}
  const currentLocation=useMemo(()=>findLocation(currentCity),[currentCity]);
  const {cityName,locationName,sunriseCityName}=currentLocation;
  
  //只要locationName沒改變就不用重新去計算
  const moment=useMemo(()=>getMoment(sunriseCityName),[sunriseCityName]);
  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  });

  useEffect(()=>{
    setCurrentTheme(moment==="day"?"light":"dark");
  },[moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage==="WeatherCard" &&(
        <WeatherCard 
          cityName={cityName}
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
          handleCurrentPageChange={handleCurrentPageChange}
        />)}
        {currentPage==="WeatherSetting" && <WeatherSetting 
        handleCurrentPageChange={handleCurrentPageChange}
        handleCityChange={handleCityChange}
        cityName={cityName}
        />}
      </Container>
    </ThemeProvider>
  );
};

export default App;
