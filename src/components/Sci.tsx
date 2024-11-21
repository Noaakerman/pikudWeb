import React from 'react'
import { scis } from '@/data/data'
import "./sci.css"

export default function Sci() {
  return (
    <>
    {
        scis.map(sci=>(
            <a href={sci.link} key={sci.id} target='_blank' className='mx-2'>
                <span className={sci.icon}></span>
            </a>
        ))
    }
    </>
  )
}
