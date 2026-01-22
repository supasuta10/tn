import React from 'react'
import Features from '../../components/web/Features'
import Testimonials from './../../components/web/Testimonials';
import Hero from './../../components/web/Hero';
import MenuPackage from '../../components/web/MenuPackage';


const Home = () => {
  return (
    <div>
      <Hero />
      <Features />
      <MenuPackage/>
      <Testimonials />
    </div>
  )
}

export default Home