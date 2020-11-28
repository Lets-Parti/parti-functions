//Database Schema. Only used as reference

let CloudFirestoreDB = 
{
    users: [
        {
            userID: 'biEX5dBoj4eAPpTn1LCsB3iDQE13', 
            email: 'matt@gmail.com',
            userHandle: 'matt8p',
            type: 'client',                                                //Either a client or service account 
            createdAt: '2020-11-28T22:06:14.024Z', 
            //imageUrl: 'image/whatever/whatever',
            //bio: 'Hey, my name is matthew',
            events: [aX1238Ddfs],                                          //Arraylist of events 
            zipcode: '85286'
        }
    ],

    events: [
        {
            userHandle: 'matt8p',                                           //userHandle of the person who created the event 
            createdAt: '2020-11-28T22:06:14.024Z',      
            title: 'Matts 20th Birthday Party', 
            description: 'Its going to be the best birthday party!', 
            eventDate: '2020-12-31T00:00:00',
            zipcode: '85286', 

            services: [
                {
                    service: 'DJ',
                    description: 'I need a DJ for my party', 
                    vendorFound: true, 
                    vendor: {
                        userID: '{userID of the vendor}',
                        contractID: '{contractID}'
                    }
                }, 
                {
                    service: 'Photography',
                    description: 'I need a Photographer for my party',
                    vendorFound: false, 
                    vendor: {}
                }
            ]
        }
    ],

    contracts: [
        //TODO: Figure out contract structure 
    ] 
}