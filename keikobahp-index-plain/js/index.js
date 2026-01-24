document.getElementById('mainLink').addEventListener('click', function(e) {
            e.preventDefault();
            const wrapper = document.getElementById('phoenixWrapper');
            const title = document.getElementById('titleArea');
            const linkUrl = this.getAttribute('href');

            wrapper.classList.add('is-flying');
            title.classList.add('is-fading-out');

            setTimeout(function() {
                window.location.href = linkUrl;
            }, 1100); 
        });
