import '/socket.io/socket.io.js'

const socket = io()

const messages = document.getElementById('messageContainer')
const form  = document.getElementById('form')
const input = document.getElementById('input')

const sendButton = document.getElementById('sendButton')
const sendIcon = sendButton.children[0]

form.addEventListener('submit', e => {
    e.preventDefault()

    animateSendIcon()

    if (input.value) {
        socket.emit('chat message', input.value)
        input.value = ''
    }
})

socket.on('chat message', msg => {
    const item = document.createElement('li')
    item.textContent = msg
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
})


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

