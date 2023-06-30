import { UploadFileProps } from "./types"

export const traverseFileTree = async (entry: FileSystemEntry) => {
  let res: File[] = []
  const internalProcess = async (entry: FileSystemEntry, path: string) => {
    const promise = new Promise<{}>((resolve, reject) => {
      const errorCallback: ErrorCallback = (e) => {
        console.error(e)
        reject(e)
      }
      if (entry.isFile) {
        ;(entry as FileSystemFileEntry).file((file) => {
          const newFile = new File([file], path + file.name, {
            type: file.type,
          })
          res.push(newFile)
          console.log(newFile)
          resolve({})
        }, errorCallback)
      } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader()
        dirReader.readEntries(async (entries) => {
          for (let i = 0; i < entries.length; i++) {
            await internalProcess(entries[i], path + entry.name + "/")
          }
          resolve({})
        }, errorCallback)
      }
    })
    await promise
  }
  await internalProcess(entry, "")
  return res
}

export const File2Upload = (file: File): UploadFileProps => {
  return {
    name: file.name,
    path: file.webkitRelativePath ? file.webkitRelativePath : file.name,
    size: file.size,
    progress: 0,
    speed: 0,
    status: "pending",
  }
}
