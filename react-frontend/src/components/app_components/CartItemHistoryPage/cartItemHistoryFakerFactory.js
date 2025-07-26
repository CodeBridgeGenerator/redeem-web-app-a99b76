
import { faker } from "@faker-js/faker";
export default (user,count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
id: faker.lorem.sentence(1),
voucherId: faker.date.past("8"),
userId: faker.lorem.sentence(1),
quantity: faker.date.past(""),
completedDate: faker.date.past(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
