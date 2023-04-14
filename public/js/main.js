function sendCommand(data) {
    $.post("/command", data, (data) => {
        if(data.success) {
            toastr.success("Command successfully executed")
        } else {
            toastr.error(data.error)
        }
    })
}