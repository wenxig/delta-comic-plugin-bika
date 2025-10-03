import { pluginName } from "@/symbol"
import View from "@/components/view.vue"
import { uni, defaultLayout, Utils } from "delta-comic-core"
import { bika } from "."

export class BikaPage extends uni.content.ContentPage {
  public static contentType = uni.content.ContentPage.toContentTypeString({
    name: 'default',
    plugin: pluginName,
    layout: defaultLayout
  })
  public override plugin = pluginName
  public override contentType = uni.content.ContentPage.toContentType(BikaPage.contentType)
  public images = Utils.data.PromiseContent.withResolvers<string[]>()
  public override loadAll() {
    return Promise.all([
      this.eps.content.isLoading.value || bika.api.comic.getComicEps(this.id).then(v => this.eps.resolve(v)),
      this.detail.content.isLoading.value || bika.api.comic.getComicInfo(this.id).then(v => {
        if (!v) {
          return Utils.message.createDialog({
            type: 'error',
            content: `${pluginName}漫画id:${this.id}审核中`,
            positiveText: '确定'
          })
        } else
          this.detail.resolve(v)
      }),
      this.pid.content.isLoading.value || bika.api.comic.getComicPicId(this.id).then(v => this.pid.resolve(String(v))),
      this.recommends.content.isLoading.value || bika.api.comic.getRecommendComics(this.id).then(v => this.recommends.resolve(v)),
      this.images.content.isLoading.value || bika.api.comic.getComicPages(this.id, Number(this.ep)).then(async v => this.images.resolve(await Promise.all(v.map(v => v.$media.toUni().getUrl())))),
    ])
  }
  public override reloadAll(): any {
    throw new Error("Method not implemented.")
  }
  public override loadAllOffline(): Promise<any> {
    throw new Error("Method not implemented.")
  }
  public override exportOffline(_save: any): Promise<void> {
    throw new Error("Method not implemented.")
  }
  public override ViewComp = View
  constructor(preload: uni.content.PreloadValue, id: string, ep: string) {
    super(preload, id, ep)
  }
}