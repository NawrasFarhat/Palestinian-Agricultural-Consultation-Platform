// src/pages/farmer/VisitPage.jsx
import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/Common/Hero";
import Recommendations from "../../components/Common/Recommendations";
import Testimonials from "../../components/Common/Testimonials";
import Contactus from "../../components/Common/Contactus";
import Footer from "../../components/Common/Footer";
import Title from "../../components/Common/Title";

const VisitPage = ({ user, onLogout }) => {

  return (
    <div className="visit-page">
      
      <Navbar role={user?.role} onLogout={onLogout} /> 
      <Hero />
      <Title title="Recommendations" />
      <Recommendations />
      <Title title="Testimonials" />
      <Testimonials /> 
      <Title title="Contactus" />
      <Contactus />
      <Footer/>
    </div>
  );
};

export default VisitPage;
