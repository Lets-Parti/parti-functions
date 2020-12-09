//Database Schema. Only used as reference

let CloudFirestoreDB = 
{
    users: [
        {
            userID: 'biEX5dBoj4eAPpTn1LCsB3iDQE13', 
            email: 'matt@gmail.com',
            userHandle: 'matt8p',
            fullName: 'Matthew Wang',
            type: 'client',                                                //Either a client or service account 
            createdAt: '2020-11-28T22:06:14.024Z', 
            imageUrl: 'image/whatever/whatever',
            events: ['aX1238Ddfs'],                                          //Arraylist of events 
            zipcode: '85286'
        },

        {
            userID: 'biEX5dBoj4eAPpTn1LCsB3iDQE13', 
            email: '808hertz@gmail.com',
            userHandle: 'matt8p',
            fullName: '808Hertz Entertainment',
            type: 'service',                                                //Either a client or service account 
            createdAt: '2020-11-28T22:06:14.024Z', 
            imageUrl: 'image/whatever/whatever',
            bio: 'We are 808Hertz Entertainment LLC, a professional entertainment service in the Arizona valley. Our service provides quality DJ, lighting, and event photography to turn your event into an unforgettable time of your life.',                                  //Arraylist of events 
            zipcode: '85286',
            reviews: {
                numberOfReviews: 1, 
                averageStars: 5, 
                reviews: [
                    {
                        userHandle: 'matt8p',
                        stars: 5, 
                        comment: '808Hertz did a fantastic job at my anniversary'
                    }
                ]
            },
            service: 'DJ',                                              
            mediaImages: ['image/whatever/whatever'],
            tags: ['DJ', 'Lighting', 'Photography'] 
        }
    ],

    events: [
        {
            createdAt: '2020-11-28T22:06:14.024Z',  
            title: 'Matts 20th Birthday Party', 
            description: 'Its going to be the best birthday party!', 
            eventDate: '2020-12-31T00:00:00',
            zipcode: '85286', 
            userHandle: 'matt8p',  

            services: [
                {
                    serviceType: 'DJ',
                    description: 'I need a DJ for my party', 
                    vendorFound: true, 
                    service: {
                        userHandle: '{userHandle of the vendor}',
                        contract: '{contractID}'
                    }
                }, 
                {
                    serviceType: 'Photography',
                    description: 'I need a Photographer for my party',
                    vendorFound: false, 
                    service: {}
                }
            ]
        }
    ],

    contracts: [
        {
            userHandle: `${userHandle}`,
            createdAt: '2020-11-28T22:07:14',
            event: `${eventID}`,
            approved: false, 
            price: 500, 
            details: 'Will DJ at the event from 8Am to 9pm ',
            service: {
                userHandle: `${userHandle}`
            }
        }
    ] 
}