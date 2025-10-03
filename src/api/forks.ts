const base = [
  {
    "url": "pic2024a2.top",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  },
  {
    "url": "go2778.com",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  },
  {
    "url": "picacomic.com",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  },
  {
    "url": "pic2024a1.top",
    "basePart": "picaapi",
    "recommendPart": "recommend",
  }
]
export const api = base.map(v => `https://${v.basePart}.${v.url}`)

export const share = base.map(v => `https://${v.recommendPart}.${v.url}`)

export const image = [
  "https://s3.go2778.com/static",
  "https://storage-b.safedataplj.com/static",
  "https://s3.picacomic.com/static",
  "https://storage.diwodiwo.xyz/static"
]