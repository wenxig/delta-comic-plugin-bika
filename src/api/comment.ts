import { _bikaUser } from "./user"
import { uni } from "delta-comic-core"
import { bika } from "."
import { pluginName } from "@/symbol"

export namespace _bikaComment {
  export interface RawBaseComment {
    _id: string
    content: string
    _user?: _bikaUser.RawUserMe
    totalComments: number
    isTop: boolean
    hide: boolean
    created_at: string
    likesCount: number
    commentsCount: number
    isLiked: boolean
  }
  export interface RawComment extends RawBaseComment {
    _comic: string
  }
  export interface RawMyComment extends RawBaseComment {
    _comic: {
      _id: string
      title: string
    }
  }
  export interface RawChildComment extends RawComment {
    _parent: string
  }

  export class BikaComment extends uni.comment.Comment {
    override sendComment(text: string, signal?: AbortSignal) {
      return bika.api.comment.sendChildComment(this.id, text, signal)
    }
    public override async like(signal?: AbortSignal) {
      const res = await bika.api.comment.likeComment(this.id, signal)
      return res === 'like'
    }
    public override async report(signal?: AbortSignal) {
      await bika.api.comment.reportComment(this.id, signal)
      return true
    }
    public override sender!: uni.user.User
    public override children = bika.api.comment.createChildCommentsStream(this.id)
    constructor(v: RawBaseComment) {
      super({
        childrenCount: v.commentsCount,
        content: {
          text: v.content,
          type: 'string'
        },
        id: v._id,
        isLiked: v.isLiked,
        likeCount: v.likesCount,
        time: new Date(v.created_at).getTime(),
        sender: {
          name: v._user?.name ?? '匿名',
          user: v._user
        },
        reported: v.hide,
        $$plugin: pluginName,
        $$meta: {
          raw: v
        },
        isTop: v.isTop
      })
      if (v._user)
        this.sender = new bika.user.User(v._user)
    }
  }
}