async function uploadUsuarios() {async function uploadUsuarios try {
    const form = new FormData()
    form.append('file', file)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`,
      {
        method: 'POST',
        body: form
      }
    )

    if (!res.ok) {
      const txt = await res.text()
      setMsg('Erro no backend: ' + txt)
      return
    }

    const json = await res.json()
    setMsg(`Upload concluído. Usuários criados: ${json.users_created}`)
  } catch (err) {
    setMsg('Erro ao enviar o arquivo')
    console.error(err)
  }
}
  if (!file) {
    setMsg('Selecione um Excel')
    return
  }

