'use client'
import { useState } from 'react'

export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className='flex gap-3 my-8 flex-wrap'>
      <a href={whatsappUrl} target='_blank' rel='noreferrer'
         className='flex items-center gap-2 bg-[#25D366] text-white px-5 py-2 rounded-lg text-sm font-bold'>
        واتساب
      </a>
      <a href={twitterUrl} target='_blank' rel='noreferrer'
         className='flex items-center gap-2 bg-[#1DA1F2] text-white px-5 py-2 rounded-lg text-sm font-bold'>
        تويتر
      </a>
      <button onClick={copyLink}
         className='flex items-center gap-2 border border-border px-5 py-2 rounded-lg text-sm'>
        {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}
      </button>
    </div>
  )
}