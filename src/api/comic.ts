import { _bikaImage } from "./image"
import { _bikaUser } from "./user"

export namespace _bikaComic {

  export interface RawBaseComic {
    _id: string
    title: string
    author: string
    totalViews: number
    totalLikes: number
    finished: boolean
    categories: string[]
    thumb: _bikaImage.RawImage
    likesCount: number
  }
  export interface RawLessComic extends RawBaseComic {
    pagesCount: number
    epsCount: number
  }
  export interface RawCommonComic extends RawBaseComic {
    updated_at: string
    description: string
    chineseTeam: string
    created_at: string
    tags: string[]
  }
  export interface RawFullComic extends RawBaseComic {
    _creator: _bikaUser.RawUser
    description: string
    chineseTeam: string
    tags: string[]
    pagesCount: number
    epsCount: number
    updated_at: string
    created_at: string
    allowDownload: boolean
    allowComment: boolean
    totalComments: number
    viewsCount: number
    commentsCount: number
    isFavourite: boolean
    isLiked: boolean
  }

  export interface RawComicEp {
    _id: string
    title: string
    order: number
    updated_at: number
    id: string
  }
  
  export interface RawPage {
    id: string
    media: _bikaImage.RawImage
    _id: string
  }
  export class Page implements RawPage {
    public id: string
    public media: _bikaImage.RawImage
    public get $media() {
      return new _bikaImage.Image(this.media)
    }
    public _id: string
    constructor(v: RawPage) {
      this.id = v.id
      this.media = v.media
      this._id = v._id
    }
  }
}