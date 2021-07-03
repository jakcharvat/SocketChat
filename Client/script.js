import '/socket.io/socket.io.js'

const socket = io()

const messages = document.getElementById('messageContainer')
const form  = document.getElementById('form')
const input = document.getElementById('input')

const sendButton = document.getElementById('sendButton')
const sendIcon = sendButton.children[0]

const newChatButton = document.getElementById('newChatButton')
const joinChatButton = document.getElementById('joinChatButton')

const newRoomPopup = document.getElementById('newRoomPopup')
const joinRoomPopup = document.getElementById('joinRoomPopup')

const createRoomForm = newRoomPopup.querySelector('form')
const roomNameTf = document.getElementById('roomNameTf')

const joinRoomForm = joinRoomPopup.querySelector('form')
const roomCodeTf = document.getElementById('roomCodeTf')

const chatsContainer = document.getElementById('chatsContainer')
const roomTemplate = document.getElementById('roomTemplate')

const chatSelectedView = document.getElementById('chatSelected')
const chatNotSelectedView = document.getElementById('chatNotSelected')

const namePopup = document.getElementById('namePopup')
const nameForm = namePopup.querySelector('form')
const usernameTf = document.getElementById('userNameTf')
const enterButton = document.getElementById('enterButton')

const channelNameLabel = document.getElementById('channelName')
const channelCodeButton = document.getElementById('channelCode')
const channelCodeSpan = channelCodeButton.querySelector('span')
const channelCodeTooltip = channelCodeButton.querySelector('.tooltip')

const userJoinedTemplate = document.getElementById('userJoinedTemplate')
const userLeftTemplate = document.getElementById('userLeftTemplate')
const chatMessageTemplate = document.getElementById('chatMessageTemplate')


const popups = document.querySelectorAll('.popup-wrapper')
popups.forEach(popup => {
    const closeButton = popup.querySelector('.cancel-button')
    if (closeButton) {
        closeButton.onclick = () => {
            closePopup(popup)
        }
    }
})

let activeButton


form.addEventListener('submit', e => {
    e.preventDefault()

    animateSendIcon()

    if (input.value) {
        socket.emit('chat message', input.value)
        input.value = ''
    }
})


nameForm.addEventListener('submit', e => {
    e.preventDefault()

    socket.emit('register', usernameTf.value)
    closePopup(namePopup)
})


socket.on('chat message', msg => {
    showMessage(msg)
})

socket.on('room joined', code => {
    const split = code.split('#')
    const roomCode = split[0]
    split.splice(0, 1)
    const roomName = split.join('#')

    const newRoom = roomTemplate.content.cloneNode(true)
    const button = newRoom.querySelector('.room')
    const name = newRoom.querySelector('.name')
    const codeSpan = newRoom.querySelector('.code-span')

    name.innerText = roomName
    codeSpan.innerText = roomCode

    chatsContainer.appendChild(newRoom)
    
    button.addEventListener('click', () => {
        openRoom(button, roomCode)
    })

    openRoom(button, roomCode)
})

socket.on('opened room', data => {
    channelNameLabel.innerText = data.roomName
    channelCodeSpan.innerText = data.roomCode

    channelCodeButton.onclick = async () => {
        try {
            await navigator.clipboard.writeText(data.roomCode)
            channelCodeTooltip.classList.remove('animate')
            setTimeout(() => channelCodeTooltip.classList.add('animate'), 50)
        } catch(error) {
            alert(`Error copying to clipboard: ${error}`)
        }
    }

    socket.emit('get chat history', data.roomCode)
})

socket.on('chat history', history => {
    messages.innerHTML = ''
    for (const message of history) {
        showMessage(message)
    }
})

socket.on('error', error => {
    alert(error)
})


function showMessage(message) {
    function addElement(template, msg) {
        const el = template.content.cloneNode(true).querySelector('.message')
        if (message.user === socket.id) {
            el.classList.add('own-message')
        }
        el.querySelector('.username').innerText = message.userName
        if (msg !== null && msg !== undefined) {
            el.querySelector('.message-text').innerText = msg
        }
        messages.appendChild(el)
    }

    switch (message.type) {
        case 'text':
            addElement(chatMessageTemplate, message.message)
            break

        case 'joined':
            addElement(userJoinedTemplate)
            break

        case 'left': 
            addElement(userLeftTemplate)
            break
    }
}


newChatButton.onclick = () => {
    newRoomPopup.classList.remove('hidden')
    roomNameTf.focus()
}

joinChatButton.onclick = () => {
    joinRoomPopup.classList.remove('hidden')
    roomCodeTf.focus()
}


createRoomForm.onsubmit = e => {
    e.preventDefault()
    socket.emit('create room', roomNameTf.value)
    roomNameTf.value = ''
    closePopup(newRoomPopup)
}


joinRoomForm.onsubmit = e => {
    e.preventDefault()
    socket.emit('join room', roomCodeTf.value)
    roomCodeTf.value = ''
    closePopup(joinRoomPopup)
}


function closePopup(popup) {
    popup.classList.add('hidden')
}



function openRoom(roomButton, roomCode) {
    if (roomButton === activeButton) { return }

    if (activeButton) {
        activeButton.classList.remove('active')
    }
    activeButton = roomButton
    roomButton.classList.add('active')
    chatNotSelectedView.classList.add('hidden')
    chatSelectedView.classList.remove('hidden')

    socket.emit('open room', roomCode)
}



function animateSendIcon() {
    const awayAnimation = sendIcon.animate([
        {  },
        {
            opacity: 0,
            transform: 'translateX(50px)'
        }
    ], {
        duration: 200,
        easing: 'ease-in'
    })

    awayAnimation.onfinish = () => {
        const moveAnimation = sendIcon.animate([
            {
                opacity: 0,
                transform: 'translateX(50px)'
            },
            {
                transform: 'translateX(-50px)',
                opacity: 0
            }
        ], {
            duration: 100,
        })

        moveAnimation.onfinish = () => {
            sendIcon.animate([
                {
                    transform: 'translateX(-50px)',
                    opacity: 0
                },
                {
                    transform: 'translate(0px)',
                    opacity: 1
                }
            ], {
                duration: 200,
                easing: 'ease-out'
            })
        }
    }
}

