(function(){
    let self = this;

    self.feriados = {
        nacionais: [],
        estaduais: [],
        municipais: []
    }

    self.local = {};

    const paths = {
        root: window.location.href
    };

    const settingsCount = {
        startVal: 365 
    };

    self.init = function(){
        self.getIp(self.getHolidays);
        ;
    };

    self.getIp = function(callback){
        new Http.Get('https://ipapi.co/json/', true)
                    .start()
                    .then(function(data){
                        self.local.state = data.region_code;
                        self.local.city = data.city;
                        callback();
                    })
    }

    self.getHolidays = function(){
        new Http.Get(paths.root + 'data/feriados_nacionais.json', true)
            .start()
            .then(function(response) {
                self.feriados.nacionais = JSON.parse(response);
                new Http.Get(paths.root + 'data/feriados_estaduais.json', true)
                    .start()
                    .then(function(response) {
                        self.feriados.estaduais = JSON.parse(response);
                        new Http.Get(paths.root + 'data/feriados_municipais.json', true)
                            .start()
                            .then(function(response) {
                                self.feriados.municipais = JSON.parse(response);
                                self.calcNextHoliday();
                        });
                });
            }
        );
    }


    self.calcNextHoliday = function(){
        let today = new Date();

        let nextHolidays = [];

        let selectedHolidays = self.feriados.nacionais; 

        if(self.feriados.estaduais[self.local.state]){
            selectedHolidays = Object.assign(selectedHolidays, self.feriados.estaduais[self.local.state]);
        }

        for(let holiday in selectedHolidays){
            let day = self.feriados.nacionais[holiday];

            let data = holiday.split('/').map(x => parseInt(x));

            year = today.getFullYear();

            if((data[1] < today.getMonth() + 1) || ((data[1] == today.getMonth() + 1) && data[0] < today.getDate()))
                year++; 

            day.date = new Date(year, data[1] - 1, data[0]);

            nextHolidays.push(day);
        }

        //Adicionar outros feriados municipais e estaduais
        nextHolidays = nextHolidays.sort(function(x, y){
            return x.date - y.date;
        });

        let nextOne = nextHolidays[0];
        let days = Math.round((nextOne.date - today)/(1000*60*60*24))

        document.getElementById('holiday').innerText = nextOne.date.toLocaleDateString() + ' - ' + nextOne.title;

        let count = new CountUp('days', days, settingsCount);
        count.start();
    };  

    if (document.readyState != 'loading')
        self.init();
    else
        document.addEventListener('DOMContentLoaded', self.init);
})();
