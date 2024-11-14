import chalk from 'chalk';
import readlineSync from 'readline-sync';

// 랜덤 숫자 생성 함수
function randomN(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 공통 공격력 증가 함수
function increaseAttack(character, increaseAmount, isMinAttack) {
  if (isMinAttack) {
    // minAttack 증가 시 maxAttack을 넘지 않도록 확인
    if (character.minAttack + increaseAmount >= character.maxAttack) {
      character.maxAttack += increaseAmount;
    } else {
      character.minAttack += increaseAmount;
    }
  } else {
    character.maxAttack += increaseAmount;
  }
}

//플레이어 공격 함수
function attackMonster(logs, player, monster) {
  const playerAttack = player.attack();  // 플레이어의 공격
  monster.hp -= playerAttack;  // 몬스터 HP 감소
  logs.push(chalk.green(`${playerAttack}의 데미지를 몬스터에게 가했습니다.`));  // 공격 로그 기록
}


// 더블 어택
function doubleAttack(logs, successChance, player, monster) {
  const chance = randomN(1, 100);

  if (chance <= successChance) { // 더블 어택 성공 시
    let totalDamage = 0;

    // 첫 번째 공격
    const playerAttack1 = player.attack();  // 첫 번째 공격
    totalDamage += playerAttack1;
    monster.hp -= playerAttack1;  // 몬스터의 HP 감소
    logs.push(chalk.green(`${playerAttack1}의 데미지를 몬스터에게 가했습니다`));

    // 두 번째 공격
    const playerAttack2 = player.attack();  // 두 번째 공격
    totalDamage += playerAttack2;
    monster.hp -= playerAttack2;  // 몬스터의 HP 감소
    logs.push(chalk.green(`${playerAttack2}의 데미지를 몬스터에게 가했습니다.`));

    logs.push(chalk.green(`연속 공격으로 총 ${totalDamage}데미지!
      `));
  } else {
    // 더블어택 실패 시
    logs.push(chalk.yellow(`더블 공격 실패!
      `));
  }
}

//연속공격
function multiAttack(logs, successChance, player, monster) {
  let totalDamage = 0;

  for (let i = 0; i < 5; i++) {
    const chance = randomN(1, 100);

    if (chance <= successChance) { // 연속 공격 성공 시

      const attack = player.attack();  // 첫 번째 공격
      totalDamage += attack;
      monster.hp -= attack;  // 몬스터의 HP 감소
      logs.push(chalk.green(`${i + 1}번쨰 공격 ${attack}의 데미지`));


      // 공격 확률 낮추기   
      successChance *= 0.6
    }
    else {
      logs.push(chalk.red(`${i + 1}번쨰 공격 실패
        `));
      break;
    }
  }
  if (`${totalDamage}` > 0) {
    logs.push(chalk.blue(`총 ${totalDamage} 데미지를 몬스터에게 가했습니다.`));
  }
}

//돌진공격
function charge(logs, player, monster) {
  const rebound = randomN(1, 2);

  const playerAttack = player.attack();  // 플레이어의 공격
  monster.hp -= Math.floor(playerAttack * 1.5);  // 몬스터 HP 감소
  player.hp -= rebound
  logs.push(chalk.green(`${Math.floor(playerAttack * 1.5)}의 데미지를 몬스터에게 가했습니다.`));  // 공격 로그 기록
  logs.push(chalk.red(`반동으로 ${rebound}의 피해를 받았습니다.`));
}

//즉사 마법 
function die(logs, successChance, monster) {
  const chance = randomN(1, 100);

  if (chance <= successChance) { // 연속 공격 성공 시
    monster.hp -= 999999999999999;
    logs.push(chalk.yellow(`즉사마법이 성공해 적이 죽었습니다.`))
  } else {
    //  즉사 실패 시
    logs.push(chalk.yellow(`즉사 마법에 실패했습니다.
      `));
  }
}

//공격불가 마법
function disableAttack(logs, successChance, monster) {
  const chance = randomN(1, 100);

  if (chance <= successChance) { // 50% 확률로 발동 성공 시
    const disableTurns = randomN(1, 3);  // 1~3턴 동안 공격 불가
    monster.disableTurns = disableTurns;  // 몬스터의 공격 불가 턴 설정
    logs.push(chalk.magenta(`공격 불가 마법이 성공해, 몬스터는 ${disableTurns}턴 동안 공격할 수 없습니다.`));
  } else {
    // 실패 시
    logs.push(chalk.yellow(`공격 불가 마법에 실패했습니다.`));
  }
}

// 플레이어 클래스
class Player {
  constructor(hp = 15, minAttack = 1, maxAttack = 6) {
    this.hp = hp;
    this.minAttack = minAttack;
    this.maxAttack = maxAttack;
    this.healAmount = 0
  }

  attack() {
    return randomN(this.minAttack, this.maxAttack);
  }

  heal() {
    const healAmount = randomN(15, 30); // 15에서 30 사이의 체력 회복
    this.hp += healAmount;
  }
}

class Monster {
  constructor(hp = 10, minAttack = 1, maxAttack = 6) {
    this.hp = hp;
    this.minAttack = minAttack;
    this.maxAttack = maxAttack;
    this.disableTurns = 0;  // 공격 불가 턴
  }

  attack() {
    // 공격 불가 상태일 경우 공격 불가 처리
    if (this.disableTurns > 0) {
      this.disableTurns--;  // 공격 불가 턴 차감
      return 0;  // 공격을 하지 않음
    }
    return randomN(this.minAttack, this.maxAttack);
  }
}


// 상태 출력 함수
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(`| 플레이어 hp: ${player.hp}  공격력: ${player.minAttack} ~ ${player.maxAttack} |`) +
    chalk.redBright(`| 몬스터 hp: ${monster.hp} 공격력: ${monster.minAttack} ~ ${monster.maxAttack} | `)
  );

  // 공격 불가 상태의 남은 턴 출력
  if (monster.disableTurns > 0) {
    console.log(chalk.yellow(`| 몬스터는 현재 ${monster.disableTurns}턴 동안 공격할 수 없습니다. |`));
  }

  console.log(chalk.magentaBright(`=====================\n`));
}

// 전투 함수
const battle = async (stage, player, monster) => {
  let logs = [];  // 전투마다 로그 초기화

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));  // 현재까지의 전투 로그 출력

    console.log(chalk.green(`\n1. 공격한다 2.더블어택(80%) 3.연속공격(초기 80%) 4.돌진 5.즉사마법(10%) 6.공격불가 마법(50%) 7.자살기술`));
    const choice = readlineSync.question('당신의 선택은? ');

    switch (choice) {
      case '1': {
        logs.push(chalk.cyan(`일반공격`))
        attackMonster(logs, player, monster);  // 일반 공격
        break;
      }
      case '2': {
        logs.push(chalk.cyan(`더블공격`))
        doubleAttack(logs, 80, player, monster);  // 80% 확률로 더블공격
        break;
      }
      case '3': {
        logs.push(chalk.cyan(`연속공격`))
        multiAttack(logs, 80, player, monster);  // 80% 확률로 연속 공격
        break;
      }
      case '4': {
        logs.push(chalk.cyan(`돌진`))
        charge(logs, player, monster);  // 돌진 공격
        break;
      }
      case '5': {
        logs.push(chalk.magenta(`즉사 마법`))
        die(logs, 10, monster)  // 10% 확률로 적이 즉사
        break;
      }
      case '6': {
        logs.push(chalk.magenta(`공격 불가 마법`))
        disableAttack(logs, 50, monster);  // 50% 확률로 몬스터의 공격 불가 마법 발동
        break;
      }
      case '7': {
        player.hp -= 999999999999999;
        logs.push(chalk.red(`자살했습니다\n`));
        break;
      }
      default: {
        logs.push(chalk.yellow(`잘못된 입력입니다. 1, 2, 3, 4, 5, 6, 7을 선택하세요.\n`));
        continue;  // 잘못된 입력은 다시 입력을 받도록
      }
    }

    // 몬스터의 공격
    if (monster.hp > 0) { // 몬스터가 살아있다면
      const monsterAttack = monster.attack();
      player.hp -= monsterAttack;
      logs.push(chalk.red(`${monsterAttack}의 데미지를 받았습니다.\n`));
    }

    // 몬스터 처치 시
    if (monster.hp <= 0) {
      logs.push(chalk.cyan(`\n몬스터 처치! 전투에서 승리했습니다!\n`));
      player.heal()
      break;
    }

    // 게임 오버
    if (player.hp <= 0) {
      break;  // 게임 오버 시 보상 화면 생략하고 전투 종료
    }
  }

  // 전투 종료 후 전체 로그 출력, 마지막 선택지 출력 없음
  console.clear();
  displayStatus(stage, player, monster);
  logs.forEach((log) => console.log(log));  // 마지막 로그 포함하여 전체 출력

  // 게임 오버가 아니면 보상 화면 출력
  if (player.hp > 0) {
    // 전투 종료 후 3초 대기
    console.log(chalk.yellow(`\n보상 화면으로 이동합니다... 잠시만 기다려 주세요...`));
    await new Promise(resolve => setTimeout(resolve, 3000));  // 3초 대기 

    await rewardScreen(player);  // 보상 선택 화면을 호출
  }
  return player.hp > 0;
};

// 보상 화면 (체력 회복 후 공격력 선택)
async function rewardScreen(player) {
  console.clear(); // 보상 화면이 뜨기 전에 이전 로그를 지웁니다.
  console.log(chalk.magentaBright(`\n=== 보상 ===`));
  console.log(chalk.cyan(`당신은 전투에서 승리하여 보상을 받았습니다!`));
  console.log(chalk.green(`체력이 ${player.hp}이 되었습니다.`));
  console.log(chalk.green(`공격력 증가! 어떤 공격력을 증가시킬까요?`));

  let minAttackSelectable = player.minAttack < player.maxAttack; // 최소 공격력 증가 가능 여부 확인

  // 선택 가능 옵션 표시
  if (!minAttackSelectable) {
    console.log(chalk.red("최소 공격력 증가 옵션이 사용할 수 없습니다. 최대 공격력만 선택 가능합니다."));
    console.log(chalk.yellow(`2. 최대 공격력 증가`));
  } else {
    console.log(chalk.yellow(`1. 최소 공격력 증가`));
    console.log(chalk.yellow(`2. 최대 공격력 증가`));
  }

  let validChoice = false;
  let rewardChoice = '';

  // 올바른 선택을 반복해서 물어봄
  while (!validChoice) {
    rewardChoice = readlineSync.question(`선택하세요 (${minAttackSelectable ? "1 또는 2 번" : "2번만 선택가능합니다"}): `);

    if (rewardChoice === '1' && minAttackSelectable) {
      validChoice = true;
      const increaseAmount = randomN(1, 3); // 최소 공격력 증가
      player.minAttack += increaseAmount;

      // 만약 minAttack이 maxAttack을 초과하게 되면 maxAttack에 맞추기
      if (player.minAttack > player.maxAttack) {
        player.minAttack = player.maxAttack;
      }

      console.clear(); // 화면을 지우고
      console.log(chalk.green(`최소 공격력이 ${increaseAmount}만큼 증가했습니다!`));
    } else if (rewardChoice === '2') {
      validChoice = true;
      const increaseAmount = randomN(1, 3); // 최대 공격력 증가
      player.maxAttack += increaseAmount;

      console.clear(); // 화면을 지우고
      console.log(chalk.green(`최대 공격력이 ${increaseAmount}만큼 증가했습니다!`));
    } else {
      // 선택 가능 여부에 따라 다른 메시지 표시
      if (minAttackSelectable) {
        console.log(chalk.red(`잘못된 선택입니다. 1 또는 2를 선택해주세요.`));
      } else {
        console.log(chalk.red(`잘못된 선택입니다. 2를 선택해주세요.`));
      }
    }
  }
}

// 게임 시작 함수
export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  // 처음 몬스터의 HP를 10으로 고정
  let monster = new Monster(10);  // 첫 스테이지에서 몬스터의 HP는 10으로 설정
  let totalMonsterHP = monster.hp; // 초기 HP 저장 (10)

  while (stage <= 20) {
    // 첫 번째 스테이지 이후에는 HP가 누적되어야 함
    if (stage > 1) {
      // 몬스터의 HP는 스테이지마다 누적해서 랜덤으로 증가 (10~20 사이)
      totalMonsterHP += randomN(5, 10); // HP 증가 (누적)
      monster.hp = totalMonsterHP; // 누적된 HP 반영
    }

    // 2 스테이지마다 몬스터 공격력 증가 (누적)
    if (stage % 2 === 0) {
      const increaseAmount = randomN(2, 4);  // 1 또는 2만큼 증가
      const isMinAttack = randomN(1, 2) === 1;  // 50% 확률로 최소 공격력 또는 최대 공격력 증가
      increaseAttack(monster, increaseAmount, isMinAttack); // 공통 함수 사용
    }

    // 전투 시작
    const result = await battle(stage, player, monster);

    if (!result) {
      console.log(chalk.red(`게임 오버!`));
      break;  // 플레이어가 죽으면 게임 종료
    }

    // 보상 받고 다음 전투 준비
    const continueChoice = readlineSync.question(chalk.green(`
      다음 전투를 진행하려면 아무키나 입력하세요: `));

    // 스테이지 올리기
    stage++;  // 스테이지 증가

    // 새 몬스터 생성 (HP는 누적된 값으로 유지, 공격력은 누적 상태로 유지)
    monster = new Monster(monster.hp, monster.minAttack, monster.maxAttack); // HP는 이전의 누적된 값으로
  }

  if (stage > 20) {
    console.log(chalk.green(`축하합니다! 모든 스테이지를 클리어했습니다!`));
  }
}
